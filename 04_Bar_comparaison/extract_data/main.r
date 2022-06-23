
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
data_source <- paste0(DATA_FOLDER, "/nordcan/database_92/source")


# get  Norway using the NORDCAN data for 1953-1957 and 2015-2019

cases <- as.data.table(readRDS(paste0(API_FOLDER, "/table/nordcan_v92/number.rds")))
reg <- fread(paste0(API_FOLDER, "/table/nordcan_v92/registry.csv"))

cases <- cases[id_code %in%  100:1000 & type == 0, ]
cases <- melt(cases, measure = patterns("^age"), value.name = c("cases"),variable.name = c("age"))
cases[, age:=as.numeric(gsub("age","",age))]

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

cancer_dict <- as.data.table(read.csv(paste0(API_FOLDER,"/table/nordcan_v92/cancer.csv")))
cancer_dict <- cancer_dict[, c("cancer_code", "label"), with=FALSE]


cancer_dict <- cancer_dict[!cancer_code %in% c(90,100,105,970,980,990 ), ]

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

# add to already data for viz


fwrite(dt_data, "data/nordcan_92.csv", row.names=FALSE)

