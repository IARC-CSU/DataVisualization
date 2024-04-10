
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
setnames(dt_new, "cancer_code", "cancer_code_new")
dt_new <- merge(dt_new,dt_cancer_select[, .(cancer_code_new, cancer_code)], by="cancer_code_new", all.x=TRUE)
dt_new[is.na(cancer_code),cancer_code:=cancer_code_new]

dt_new <- dt_new[, .(cases=sum(cases), py=sum(py)), by=c("sex", "age", "cancer_code", "id_code")]

names(dt_base)
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
names(dt_base)
names(dt_data)
## Use overtime update to get columbia cali et India chennai

viz_folder <- "C:/project/DataVisualization/04_Bar_comparaison"
data_source <- paste0("C:/project/globocan_estimates/estican/result/CI5/")
cases <- as.data.table(readRDS(paste0(data_source, "overtime_update.rds")))
reg <- fread(paste0(data_source, "registry_dict.csv"))
cancer_dict <-fread(paste0(data_source, "cancer_dict.csv"))

## get colombia cali and india

	cases <- cases[id_code %in%  c(17000, 35600) & type == 0 & sex != 0, ]
	male_cancer <- c(19,20)
	female_cancer <- c(14,15,16,17,18)

	for (i_cancer in male_cancer)
	{
		dt_temp <- unique(cases[, c("year", "type", "id_code", "age", "py"), with=FALSE])
		dt_temp[, cases:=0]
		dt_temp[, sex:=2]
		dt_temp[, cancer_code:=i_cancer]
		cases <- rbind(cases, dt_temp)
	}

	for (i_cancer in female_cancer)
	{
		dt_temp <- unique(cases[, c("year", "type", "id_code", "age",  "py"), with=FALSE])
		dt_temp[, cases:=0]
		dt_temp[, sex:=1]
		dt_temp[, cancer_code:=i_cancer]
		cases <- rbind(cases, dt_temp)
	}


	cases[, min_year := min(year), by="id_code"]
	cases[, max_year := max(year), by="id_code"]
	unique(cases[, c("id_code", "min_year", "max_year"), with=FALSE])


	cases <- cases[(year < (min_year+5)) | (year > (max_year-5))]

	cases[year < (min_year+5), year := min_year+2]
	cases[year > (max_year-5), year := max_year-2]


	cases <- cases[,.(cases=sum(cases), py=sum(py)),
	by=c("id_code", "year","min_year", "max_year", "sex", "age", "cancer_code"))]

	dt_data <- as.data.table(csu_asr(cases, "age","cases", "py",
		group_by=c("id_code","sex", "cancer_code", "year","min_year", "max_year")))

	dt_data[year==min_year+2, per1:=min_year]
	dt_data[year==min_year+2, per2:=min_year+4]


	dt_data[year==max_year-2, per1:=max_year-4]
	dt_data[year==max_year-2, per2:=max_year]

	dt_data[year==min_year+2, volume:=1]
	dt_data[year==max_year-2, volume:=10]

	dt_data[, year:=NULL]
	dt_data[, min_year:=NULL]
	dt_data[, max_year:=NULL]



	cancer_dict <- cancer_dict[, c("cancer_code", "label"), with=FALSE]


	cancer_dict <- cancer_dict[!cancer_code %in% c(0,5,6 ), ]

	dt_data <- merge(dt_data, cancer_dict, by=c("cancer_code"))

	names(dt_data)
	dt_data <- Rcan:::core.csu_dt_rank(dt_data, "asr", "cancer_code", 
		group_by = c("id_code","sex", "volume"),ties.method="first")

	reg <- reg[, c("id_code", "id_label"), with=FALSE]
	dt_data <- merge(dt_data, reg, by=c("id_code"))

	setnames(dt_data, "id_code", "country_code")
	setnames(dt_data, "id_label", "country_label")
	setnames(dt_data, "cancer_code", "cancer")
	setnames(dt_data, "label", "cancer_label")
	setnames(dt_data, "CSU_RANK", "rank")

	dt_data[, rank_value:=NULL]
	setorder(dt_data, "country_code", "sex", "volume", "rank")

	fwrite(dt_data, paste0(viz_folder, "/data/overtime_up.csv"), row.names=FALSE)

	

########
# get  Norway using the NORDCAN data for 1953-1957 and 2015-2019
	data_source <- paste0(DATA_FOLDER, "/nordcan/database_92/source")
	cases <- as.data.table(readRDS(paste0(API_FOLDER, "/table/nordcan_v92/number.rds")))
	reg <- fread(paste0(API_FOLDER, "/table/nordcan_v92/registry.csv"))
	cancer_dict <- as.data.table(read.csv(paste0(API_FOLDER,"/table/nordcan_v92/cancer.csv")))

	cases <- cases[id_code %in%  100:1000 & type == 0, ]
	cases <- melt(cases, measure = patterns("^age"), value.name = c("cases"),variable.name = c("age"))
	cases[, age:=as.numeric(gsub("age","",age))]

	#add 0 data for sex specific
	male_cancer <- cancer_dict[gender==1,]$cancer_code
	female_cancer <- cancer_dict[gender==2,]$cancer_code


	for (i_cancer in male_cancer)
	{
		dt_temp <- unique(cases[, c("year", "type", "id_code", "age"), with=FALSE])
		dt_temp[, cases:=0]
		dt_temp[, sex:=2]
		dt_temp[, cancer_code:=i_cancer]
		cases <- rbind(cases, dt_temp)
	}

	for (i_cancer in female_cancer)
	{
		dt_temp <- unique(cases[, c("year", "type", "id_code", "age"), with=FALSE])
		dt_temp[, cases:=0]
		dt_temp[, sex:=1]
		dt_temp[, cancer_code:=i_cancer]
		cases <- rbind(cases, dt_temp)
	}




	pop <- readRDS(paste0(API_FOLDER,"/table/nordcan_v92/population.rds"))
	pop <- melt(pop, measure = patterns("^age"), value.name = c("pop"),variable.name = c("age"))
	pop[, age:=as.numeric(gsub("age","",age))]

	cases <- merge(cases, pop, by=c("id_code", "type", "year", "sex", "age"))

	cases[, min_year := min(year), by="id_code"]
	cases[, max_year := max(year), by="id_code"]
	unique(cases[, c("id_code", "min_year", "max_year"), with=FALSE])


	cases <- cases[(year < (min_year+5)) | (year > (max_year-5))]

	cases[year < (min_year+5), year := min_year+2]
	cases[year > (max_year-5), year := max_year-2]


	cases <- cases[,.(cases=sum(cases), pop=sum(pop)),
	by=c("id_code", "year","min_year", "max_year", "sex", "age", "cancer_code"))]

	dt_data <- as.data.table(csu_asr(cases, "age","cases", "pop",
		group_by=c("id_code","sex", "cancer_code", "year","min_year", "max_year")))

	dt_data[year==min_year+2, per1:=min_year]
	dt_data[year==min_year+2, per2:=min_year+4]


	dt_data[year==max_year-2, per1:=max_year-4]
	dt_data[year==max_year-2, per2:=max_year]

	dt_data[year==min_year+2, volume:=1]
	dt_data[year==max_year-2, volume:=10]

	dt_data[, year:=NULL]
	dt_data[, min_year:=NULL]
	dt_data[, max_year:=NULL]


	cancer_dict <- cancer_dict[, c("cancer_code", "label"), with=FALSE]


	cancer_dict <- cancer_dict[!cancer_code %in% c(10,20,30,90,100,230,316,321,390,392,401,402,404,405,406,407,408,409,410,420, 430,453,454,455,456,970,980,990 ), ]

	dt_data <- merge(dt_data, cancer_dict, by=c("cancer_code"))

	names(dt_data)
	dt_data <- Rcan:::core.csu_dt_rank(dt_data, "asr", "cancer_code", 
		group_by = c("id_code","sex", "volume"),ties.method="first")

	reg <- reg[, c("id_code", "id_label"), with=FALSE]
	dt_data <- merge(dt_data, reg, by=c("id_code"))

	setnames(dt_data, "id_code", "country_code")
	setnames(dt_data, "id_label", "country_label")
	setnames(dt_data, "cancer_code", "cancer")
	setnames(dt_data, "label", "cancer_label")
	setnames(dt_data, "CSU_RANK", "rank")
	setnames(dt_data, "pop", "py")

	dt_data[, rank_value:=NULL]

	# add 0 data for sex specific




	fwrite(dt_data, "data/nordcan_92.csv", row.names=FALSE)

	setorder(dt_data, "country_code", "sex", "volume", "rank")
	View(dt_data[country_code == 578,])
