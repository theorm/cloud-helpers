define generate_file_from_protobuf
	./node_modules/.bin/pbjs \
		--path ${PWD} \
		-t static-module \
		--no-comments \
		--force-number \
		-l eslint-disable \
		-w commonjs \
		-o $(2) \
		$(1)
endef

generate-from-protobuf:
	$(call generate_file_from_protobuf,lib/helpers/messaging/messaging.proto,lib/helpers/messaging/generated/messaging.js)
