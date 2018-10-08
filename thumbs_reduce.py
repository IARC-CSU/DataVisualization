import os
import subprocess
import re

dir_base = "C:/Projects/DataVisualization/"

for dir in os.listdir(dir_base):


    pattern = "^(\d+)_.+$"
    if re.search(pattern, dir) :
        for thumbs in os.listdir(dir_base + dir):
            pattern2 = "^thumbs"
            if re.search(pattern2, thumbs) :
                path_thumbs = os.path.join(dir_base+ dir, thumbs)
                print(path_thumbs)
                subprocess.call(['magick', path_thumbs, '-coalesce', '-scale', '350',path_thumbs], shell=True)


