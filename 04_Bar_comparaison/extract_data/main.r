
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


cancer_dict <- cancer_dict[!cancer_code %in% c(10,20,30,90,100,230,300,316,321,390,392,401,402,404,405,406,407,408,409,410,420, 430,453,454,455,456,970,980,990 ), ]

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
