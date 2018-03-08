import csv
import sys

txt_file = "MyDataRaw.txt"
csv_file = "data.csv"

in_txt 	= open(txt_file, "r")
out_csv = csv.writer(open(csv_file, 'wb'))

file_string = in_txt.read()

file_list = file_string.split('\n')

for row in file_list:       
    out_csv.writerow(row)
