
		library(data.table)
		library(Rcan)
		library(RMySQL)
		library(jsonlite)
		library(openxlsx)
		library(zoo)



	setwd("C:/project/DataVisualization/04_Bar_comparaison")
	file_env <- ifelse(file.exists(".env.local"), ".env.local", ".env")
	readRenviron(file_env)
	DATA_FOLDER <- Sys.getenv("DATA_FOLDER")
	API_FOLDER <- Sys.getenv("API_FOLDER")

	# dt_country <- unique(dt_base[, .(country_code, country_label)])
	# fwrite(dt_country, "dict/country_temp.csv")

	# dt_cancer <- unique(dt_base[, .(cancer, cancer_label)])
	# fwrite(dt_cancer, "dict/cancer_temp.csv")



	dt_cancer_select <- fread("dict/cancer_link.csv")
	dt_country_select <- fread("dict/country_link.csv")
	## update from CI5 XII

	dt_base <- fread("data/CI5IvsCI5X.csv")
	dt_base <- dt_base[volume == 1,]
	setnames(dt_base, "country_code", "id_code_base")
	dt_base <- merge(dt_base,dt_country_select[, .(id_code, id_code_base)], by="id_code_base")
	dt_base[, id_code_base:=NULL]

setnames(dt_base, "cancer", "cancer_code_base")
dt_base <- merge(dt_base,unique(dt_cancer_select[, .(cancer_code, cancer_code_base)]), by="cancer_code_base")
dt_base[, cancer_code_base:=NULL]

# select country in CI5 XII
dt_new <- fread(paste0(DATA_FOLDER, "/central/CI5XII/summary/data.csv"))
dt_country_select <- fread("dict/country_link.csv")
dt_new <- merge(dt_new,dt_country_select[, .(id_code, country_code)], by="id_code", all.y=TRUE)
dt_new[is.na(cases),]

# add country grouped
dt_temp <- fread(paste0(DATA_FOLDER, "/central/CI5XII/summary/data.csv"))
dt_temp_reg <- fread(paste0(DATA_FOLDER, "/central/CI5XII/summary/id_dict.csv"))

dt_temp_reg <- dt_temp_reg[country_code %in% c(dt_new[is.na(cases),]$country_code),]
dt_temp <- merge(dt_temp, dt_temp_reg[, .(id_code)], by="id_code")

dt_temp <- dt_temp[, .(cases=sum(cases), py=sum(py)), by=c("sex", "age", "cancer_code")]
dt_temp[,id_code := 124]
dt_new[,country_code := NULL]

dt_new <- rbind(dt_new[!is.na(cases),],dt_temp)

# select cancer in CI5 XII
dt_new <- dt_new[cancer_code < 61,]
dt_new <- dt_new[cancer_code != 25,] # drop other skin
setnames(dt_new, "cancer_code", "cancer_code_new")
dt_new <- merge(dt_new,dt_cancer_select[, .(cancer_code_new, cancer_code)], by="cancer_code_new", all.x=TRUE)

temp_new_cancer <- unique(dt_new[is.na(cancer_code),]$cancer_code_new)
# after checking new cancer are not in new top t10 drop new cancer
dt_new <- dt_new[!is.na(cancer_code),]


dt_new[is.na(cancer_code),cancer_code:=cancer_code_new]
dt_new <- dt_new[, .(cases=sum(cases), py=sum(py)), by=c("sex", "age", "cancer_code", "id_code")]
dt_new <- as.data.table(
	csu_asr(dt_new, "age", "cases", "py",
		group_by=c("cancer_code", "id_code","sex"), var_age_group=c("id_code"),missing_age = 19))

dt_data <- Rcan:::core.csu_dt_rank(dt_new, "asr", "cancer_code", 
		group_by = c("id_code","sex"),ties.method="first")

setnames(dt_data, "CSU_RANK", "rank")
dt_data[, rank_value:=NULL]

names(dt_data)
dt_data[, volume := 2]
names(dt_base)

## cancer_label/ per1, per2, country_label

## get cancer_label

dt_temp <- unique(dt_data[, .(cancer_code)])
dt_temp <- merge(dt_temp, unique(dt_cancer_select[, .(cancer_code, cancer_label_base)]), by=c("cancer_code"), all.x=TRUE)
dt_temp2 <- fread(paste0(DATA_FOLDER, "/central/CI5XII/summary/cancer_dict.csv"))
dt_temp <- merge(dt_temp, dt_temp2[,.(cancer_code, cancer_label)], by=c("cancer_code"), all.x=TRUE)
dt_temp[is.na(cancer_label_base), cancer_label_base:=cancer_label]
dt_temp[, cancer_label:=NULL]
setnames(dt_temp, "cancer_label_base", "cancer_label")
dt_data <- merge(dt_data, dt_temp, by="cancer_code")


# get reg label
dt_temp <- unique(dt_base[, .(id_code, country_label)])
dt_data <- merge(dt_data, dt_temp, by="id_code")

# get per1 per 2
dt_temp <- fread(paste0(DATA_FOLDER, "/central/CI5XII/summary/id_dict.csv"))[, .(id_code, period)]
dt_data <- merge(dt_data, dt_temp, by="id_code", all.x=TRUE)
dt_data[, per1:=sub("(\\d{4})-(\\d{4})", "\\1", period)]
dt_data[, per2:=sub("(\\d{4})-(\\d{4})", "\\2", period)]
dt_data[, period:=NULL]

#special canada
dt_data[id_code == 124,per1:= 2013]
dt_data[id_code == 124,per2:= 2017]

dt_data <- rbind(dt_base, dt_data)
setnames(dt_data, "id_code", "country_code")
fwrite(dt_data, "data/CI5IvsCI5XII.csv", row.names=FALSE)


dt_data

dt_temp <- dt_data[cancer_code %in% temp_new_cancer,]
dt_temp <- dt_temp[rank <= 10,]
setorder(dt_temp, rank)

dt_temp <- dt_data[country_label == "Canada" & volume == 2 & sex == 1,]
setorder(dt_temp, rank)

