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


# for i in {2..5}
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
#      https://www.lightnovelworld.com/novel/the-novels-extra-05122223/chapters?page=$i/
# sleep 1
# done



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
#      https://yeshu5.com/indexlist/55791/

# for i in {1..10}
# do
# # wget --wait=1 \
# #      --level=1 \
# # 	 --limit-rate=20K \
# # 	 --recursive \
# # 	 --page-requisites \
# # 	 --user-agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0' \
# # 	 --convert-links \
# # 	 --adjust-extension \
# #      --reject '*.js,*.css,*.ico,*.txt,*.gif,*.jpg,*.jpeg,*.png,*.mp3,*.pdf,*.tgz,*.flv,*.avi,*.mpeg,*.iso' \
# #      --ignore-tags=img,link,script \
# #      --header="Accept: text/html" \
# #      https://novelfire.net/book/genius-detective/chapters?page=$i/
# sleep 1
# done
# curl 'https://novelfire.net/book/genius-detective/chapters?page=10' \
#   -H 'authority: novelfire.net' \
#   -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
#   -H 'accept-language: en-US,en;q=0.9' \
#   -H 'cache-control: no-cache' \
#   -H 'cookie: 1005=visited; lnusrconf=18%2Cdefault%2Cfalse%2Cblack%2Cpurple%2Cen%2C0%2C1; cf_clearance=ixlOJ3TX_ckEdBbAemgg17maXjJFvjSPKP3ATGh0_mk-1711230661-1.0.1.1-3gm4Sh6YStK23WxIAfEeMLemaV9P9QzrK8h.hDiyQK2tnqiOidb66A9ldxJdVaHtkvylMwizOWqcsgRcNjA5Cw; googtrans=null; XSRF-TOKEN=eyJpdiI6IjBiMjlwa0pRbDU2ZkwwTWJEcUVkSEE9PSIsInZhbHVlIjoibmNUT2d5aE5mNERSU2tTZHB6NFZLTFZ4QmJLQVlBcEduUnlTU0tDaUtoUGJrSzByRGFrcWo0VmlHaHk1UXM3aXBvNStmdk9CbXphQjlicEtXTlJMcS82bFg2MkdpNGZiNU1VVmpiRjdSY0VXZStMQUpFNTBLRFp5S0NhdUpLL2QiLCJtYWMiOiIyODEzOThjMjlhNGJhZmFlZGVhOWYxNTBmM2MwNzVkN2Y4OGY1ZGYzMmU3NDZiY2ZjYzlkNDRlNWQ0ZGNiMTlmIiwidGFnIjoiIn0%3D; novelfirenet_session=eyJpdiI6IlgrZ0plZTFZdlBOQjBhNm1EbFdiMGc9PSIsInZhbHVlIjoiTzdCYXh4b3FVVGhaZFVtSmJlVjh0RHlMVC9KMSt4RUllV2owdlhNRzVTNmtZTGpLVzdOWG02cUxjK09jNmllVnFzQ3NFRWJ5UjhPYlllLzNoL0haOVYvL3Z2YU1ycnpZempGcmFqdUF0ZjB1RS9YOWVydi8xWk83dkFqY2F5ZEQiLCJtYWMiOiJmNmJiMDc2ODI1N2M1ZmFiOTlhNDE4MDU3OGJiODU0MGIzZGRjMjc2YzgzNDM0ODJiZjhkMmRmOGNmY2U0ZDkyIiwidGFnIjoiIn0%3D; cf_chl_3=abcfe0080df13b6; cf_chl_rc_i=3' \
#   -H 'dnt: 1' \
#   -H 'pragma: no-cache' \
#   -H 'referer: https://novelfire.net/book/genius-detective/chapters?page=10' \
#   -H 'sec-ch-ua: "Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"' \
#   -H 'sec-ch-ua-arch: "x86"' \
#   -H 'sec-ch-ua-bitness: "64"' \
#   -H 'sec-ch-ua-full-version: "122.0.2365.80"' \
#   -H 'sec-ch-ua-full-version-list: "Chromium";v="122.0.6261.112", "Not(A:Brand";v="24.0.0.0", "Microsoft Edge";v="122.0.2365.80"' \
#   -H 'sec-ch-ua-mobile: ?0' \
#   -H 'sec-ch-ua-model: ""' \
#   -H 'sec-ch-ua-platform: "Windows"' \
#   -H 'sec-ch-ua-platform-version: "15.0.0"' \
#   -H 'sec-fetch-dest: document' \
#   -H 'sec-fetch-mode: navigate' \
#   -H 'sec-fetch-site: same-origin' \
#   -H 'sec-gpc: 1' \
#   -H 'upgrade-insecure-requests: 1' \
#   -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0'
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
#     mv $i 00$i
# done

# for i in {10..99}
# do
#     mv $i 0$i
# done

# for i in {100..999}
# do
#     mv $i 0$i
# done


# lazy matching
# 第[0-9]+部[\s\S]*?


# match with anything as long as no closing bracket
# “(?!.*(”))

# match with anything as long as next char isn't in list
# 凌(?!(蘭|兰|霄|秦|家|肃|宅|零|。|乱|天|太|逸|虐|厉|夫|南|华|宇|泽|晨|氏|？|队|团|大|老|伯|学|，|中|式|空|爸|妈|这个姓|两可|迟|…|辱|人|将|王|驾|指挥官|少|军|、|姓|兄弟))


# for i in {1..2707}
# do
# curl -o test/$i.html 'https://www.wuxiaworld.com/novel/beastmaster-of-the-ages/bota-chapter-'$i \
#   -H 'authority: www.wuxiaworld.com' \
#   -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
#   -H 'accept-language: en-US,en;q=0.9' \
#   -H 'cache-control: no-cache' \
#   -H 'cookie: AMP_MKTG_d3c3d0c919=JTdCJTIycmVmZXJyZXIlMjIlM0ElMjJodHRwcyUzQSUyRiUyRnd3dy5iaW5nLmNvbSUyRiUyMiUyQyUyMnJlZmVycmluZ19kb21haW4lMjIlM0ElMjJ3d3cuYmluZy5jb20lMjIlN0Q=; cf_clearance=H3OlzMF_eX8DfK3ATCaa3hSVSbLS3hCyw7FIRTt0u2c-1711229070-1.0.1.1-6JmEguQoZNT_4I3Wz9ND2pUtLycrbEnrdNoY5Kmt0uFbu6hU.97fNEXxLPuUuGkOMEYvW8maTm2CrUdhXDiAgQ; AMP_d3c3d0c919=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIxNjM2YTk1OS0yNjRmLTQyMWItOTU4My1kNTMwNzgwYzQ5ZTQlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjI2ZTRlYTIyZS0wNjAyLTQ0MmItYjgyYS01ZWVhZmZkYjY1YWQlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzExMjI5MDU5NzY2JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTcxMTIyOTUxOTcyOCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTI5JTdE; __cf_bm=czG5XwcYX5zeCz7FH2heRKBvN05LwFV9KVhXPuCSJuE-1711229567-1.0.1.1-WbbON1GrbJ5HX98btC.VJx1g0NZxSPSJq9_4BdzRuLOvwtyaj2WZ1_.RwGURcBZ1276JdNa.u0EUGq5fGvcNbg' \
#   -H 'dnt: 1' \
#   -H 'pragma: no-cache' \
#   -H 'sec-fetch-dest: document' \
#   -H 'sec-fetch-mode: navigate' \
#   -H 'sec-fetch-site: same-origin' \
#   -H 'sec-fetch-user: ?1' \
#   -H 'sec-gpc: 1' \
#   -H 'upgrade-insecure-requests: 1' \
#   -H 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/122.0.0.0'
# sleep 1
# done