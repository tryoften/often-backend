for i in dump-*
	do curl -s -XPOST localhost:9200/_bulk --data-binary "@$i"
	echo "$i"
	sleep 10s
done
