# for i in {1..1489}
# do
# curl -o test/$i.html 'https://m.ddxs.com/chuanyueweilaizhinanrenbuhaodang/'$i'.html' \
#     -H 'authority: m.ddxs.com' \
#     -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
#     -H 'accept-language: en-US,en;q=0.9' \
#     -H 'cache-control: no-cache' \
#     -H 'cookie: cf_clearance=NBMGOhBgZtd5xToiuVQYWiifCZmKiCQPxXu5VQewpTE-1710468484-1.0.1.1-2j.bMUkBSYB4S7XjqDf1kLgcDO96ReEgFebb4VgXOvnQFgcIodBwASgEdO8Oq48sQ_JWygZkKtJyK3AJOnYknA' \
#     -H 'dnt: 1' \
#     -H 'pragma: no-cache' \
#     -H 'referer: https://www.ddxs.com/' \
#     -H 'sec-fetch-dest: document' \
#     -H 'sec-fetch-mode: navigate' \
#     -H 'sec-fetch-site: same-site' \
#     -H 'sec-gpc: 1' \
#     -H 'upgrade-insecure-requests: 1' \
#     -H 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/122.0.0.0'
# sleep 1
# done

# for i in {3..61}
# do
# wget --wait=1 \
#      --level=1 \
# 	 --limit-rate=20K \
# 	 --recursive \
# 	 --page-requisites \
# 	 --user-agent=Mozilla \
# 	 --convert-links \
# 	 --adjust-extension \
#      --reject '*.js,*.css,*.ico,*.txt,*.gif,*.jpg,*.jpeg,*.png,*.mp3,*.pdf,*.tgz,*.flv,*.avi,*.mpeg,*.iso' \
#      --ignore-tags=img,link,script \
#      --header="Accept: text/html" \
#      https://m.biquge365.net/shu/88297_$i/
# sleep 1
# done

# for i in {1..1497}
# do
#     echo $i
# done

# for i in {1..1497}
# do
#     mv $i.html $i
# done


# for i in {1..9}
# do
#     mv $i 000$i
# done

# for i in {10..99}
# do
#     mv $i 00$i
# done

# for i in {100..999}
# do
#     mv $i 0$i
# done