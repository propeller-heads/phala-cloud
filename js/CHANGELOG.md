## [0.2.1-beta.4](https://github.com/Phala-Network/phala-cloud/compare/js-v0.2.1-beta.4...js-v0.2.1-beta.4) (2025-11-28)

### feat

* add standalone patch api for docker compose & prelaunch script ([efc9a05](https://github.com/Phala-Network/phala-cloud/commit/efc9a052c2fb0b4cf6eedce628c81ef86826fa4d))
* add validate rule to cvm name when creating cvm ([92138c0](https://github.com/Phala-Network/phala-cloud/commit/92138c0de0021aa06e597aa321c9a293bb078e2a))
* unify name convention across cli & sdk ([9f0d1e5](https://github.com/Phala-Network/phala-cloud/commit/9f0d1e5d5f7b600a1c963816ce38bd1b402885ef))
* update cvm_id ([a66bc1f](https://github.com/Phala-Network/phala-cloud/commit/a66bc1fe4a42dd01ef3f1548e54562eb5541e193))

## [0.2.1-beta.4](https://github.com/Phala-Network/phala-cloud/compare/js-v0.2.1-beta.2...js-v0.2.1-beta.4) (2025-11-12)

### feat

* add smart CVM ID format detection and normalization ([da007bd](https://github.com/Phala-Network/phala-cloud/commit/da007bd4e9b9156968158bdecb9a9a1c264a532f))
* added support for custom nonce & app-id on provisioning ([da7c944](https://github.com/Phala-Network/phala-cloud/commit/da7c944eba3520ff68a7ece253f93c883b9364ec))
* added transaction_hash to update_cvm_envs ([6789070](https://github.com/Phala-Network/phala-cloud/commit/678907042de1336c3c48a7f7b0fb37504c6bc7b1))
* added updateCvmEnvs action ([87b1f14](https://github.com/Phala-Network/phala-cloud/commit/87b1f146dc0ab757bf8410038e71879483612e03))
* **js:** export SUPPORTED_API_VERSIONS ([be627f9](https://github.com/Phala-Network/phala-cloud/commit/be627f9f1540fdab72990a1ed9eac13ab9c3cec7))

### fix

* make sigstore happier ([58b8063](https://github.com/Phala-Network/phala-cloud/commit/58b8063f78a21cdd8e70a5985081d524fa789db6))

## [0.2.1-beta.2](https://github.com/Phala-Network/phala-cloud/compare/js-v0.2.1-beta.1...js-v0.2.1-beta.2) (2025-11-10)

### feat

* adjust the cvm state schema ([9900535](https://github.com/Phala-Network/phala-cloud/commit/990053566103adfd9924d5ffd68b8032b32f9384))
* example script deploy-gpu-instance.ts ([ea429b2](https://github.com/Phala-Network/phala-cloud/commit/ea429b290a8985338ded6420931674e09ecd9a4a))
* update @phala/dstack-sdk to 0.5.7 ([ed0e0cf](https://github.com/Phala-Network/phala-cloud/commit/ed0e0cf24443b162f49ef2a083918bf26878ac2c))

### fix

* provision CVM argument signature is incorrect ([cbee5db](https://github.com/Phala-Network/phala-cloud/commit/cbee5db03178250db9d147f8879a841dcdb82ca3))

## [0.2.1-beta.1](https://github.com/Phala-Network/phala-cloud/compare/js-v0.2.0...js-v0.2.1-beta.1) (2025-11-10)

### feat

* added list instance types API ([b1f3294](https://github.com/Phala-Network/phala-cloud/commit/b1f3294788705a647a52a226d535763c044e1fd0))
* added parser for structured error ([71d5e45](https://github.com/Phala-Network/phala-cloud/commit/71d5e453de557099c48cb3faf0f2d50938d997fe))
* adjust cvm provision API & deploy API schemas ([f42fccf](https://github.com/Phala-Network/phala-cloud/commit/f42fccfc029e02b5d65ae1c8643d24984e8283b9))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* update deploy script example ([a6806a5](https://github.com/Phala-Network/phala-cloud/commit/a6806a5cb028044376c548309073654ac988a037))

### fix

* FastApiValidationErrorItem not parsed correctly ([6d696c7](https://github.com/Phala-Network/phala-cloud/commit/6d696c7021a98ab748b1a85dde62518c494e6f3a))
* provision cvm schema ([031fc32](https://github.com/Phala-Network/phala-cloud/commit/031fc3242fd7fa5f894f319ea613f891b104cca9))
* when provisioning compose_file.name is optional ([0259de0](https://github.com/Phala-Network/phala-cloud/commit/0259de0408507368d378610f7bf84b63dd72f6dc))

## [0.2.0](https://github.com/Phala-Network/phala-cloud/compare/js-v0.1.2...js-v0.2.0) (2025-11-05)

### feat

* added actions get_available_os_images and update_os_image ([95e5688](https://github.com/Phala-Network/phala-cloud/commit/95e5688c14f9451791fd8b59bef6950a5e326652))
* added getCvmState & safeGetCvmState ([fc791ac](https://github.com/Phala-Network/phala-cloud/commit/fc791acc28834f1255b5a8def32494cc128935cf))
* added next-app-ids API ([26d9dfc](https://github.com/Phala-Network/phala-cloud/commit/26d9dfce02e29f80bf572aff1268e60db314d580))
* experimental watchCvmState implementation ([ce316d9](https://github.com/Phala-Network/phala-cloud/commit/ce316d9d3af9c865c7b27471a8844f5d8e025485))
* improve type inference for define-action ([e32a71c](https://github.com/Phala-Network/phala-cloud/commit/e32a71c3dd6d4460bcd06c7761da17124b70676a))

## [0.1.2](https://github.com/Phala-Network/phala-cloud/compare/js-v0.1.1...js-v0.1.2) (2025-10-29)

### docs

* added api versioning docs ([443f71c](https://github.com/Phala-Network/phala-cloud/commit/443f71c7873eae7fc81e6760b716614edcc55f7f))

### feat

* **sdk:** redesign errors & added event emitter support ([c2036fa](https://github.com/Phala-Network/phala-cloud/commit/c2036fa6a87587269c516538ea9573bed7596f9a))

### fix

* **cvms:** include update_env_vars in compose file update request body ([f3eb2cd](https://github.com/Phala-Network/phala-cloud/commit/f3eb2cd40ae7515e5e26fd8543e088da780d579c))
* error check in define-action ([ed8b8b9](https://github.com/Phala-Network/phala-cloud/commit/ed8b8b9578bd4b213b0a7bfdd457c8108af0b466))

## [0.1.1](https://github.com/Phala-Network/phala-cloud/compare/js-v0.1.1-beta.3...js-v0.1.1) (2025-10-24)

### feat

* attach getHash & toString to AppCompose object ([d013f99](https://github.com/Phala-Network/phala-cloud/commit/d013f99ac269a5bea196c801104e1868fcaa91df))
* export utils function in get_compose_hash ([4c4c5fc](https://github.com/Phala-Network/phala-cloud/commit/4c4c5fcce1c2cfe2aaaad48f7539512d220e4621))
* remove autofillComposeFileName for provision_cvm ([853028e](https://github.com/Phala-Network/phala-cloud/commit/853028e67281adf1db26c92400f6b97f4b8c0f24))

## [0.1.1-beta.3](https://github.com/Phala-Network/phala-cloud/compare/js-v0.1.1-beta.2...js-v0.1.1-beta.3) (2025-10-15)

### feat

* added all new actions to decorated client ([5f96a36](https://github.com/Phala-Network/phala-cloud/commit/5f96a361e7215ef0cfd9216bb7c7cdc08b405bb6))
* added cvm operations ([1b3dd21](https://github.com/Phala-Network/phala-cloud/commit/1b3dd21e3eaa0408cc12417ee29687e9f648defb))
* added schema CvmId ([c15b115](https://github.com/Phala-Network/phala-cloud/commit/c15b115d4d424fe6f521e571c8184c8b70bad2a4))
* cvm query actions ([6281c4f](https://github.com/Phala-Network/phala-cloud/commit/6281c4f3d23acd02bccd421a4ac0498015215b35))
* CVM Update Operations ([0faf460](https://github.com/Phala-Network/phala-cloud/commit/0faf460840545f396d66b9221d0388bdec748a44))
* optimized for CvmLegacyDetailSchema & added VMSchema ([7f8a1ad](https://github.com/Phala-Network/phala-cloud/commit/7f8a1ada619ad892911257cc90a57ba5a58d7c93))

### fix

* API request payload structure & adjust schemas ([b18db5e](https://github.com/Phala-Network/phala-cloud/commit/b18db5ec3c28b92509ffec985f89a3bb7062cd74))

### refactor

* using the new CvmId in get_cvm_info & get_cvm_compose_file ([728ac08](https://github.com/Phala-Network/phala-cloud/commit/728ac08281385cf9d88f0b0554a9923326a65119))

## [0.1.1-beta.2](https://github.com/Phala-Network/phala-cloud/compare/js-v0.1.1-beta.1...js-v0.1.1-beta.2) (2025-10-13)

### docs

* update code examples ([4476b29](https://github.com/Phala-Network/phala-cloud/commit/4476b2935a3e0c778865698c47c0082b99795a8c))

### feat

* improve type hints for the decorated client ([32c03cf](https://github.com/Phala-Network/phala-cloud/commit/32c03cf181d06c6fa2f7f8e7d3688cf7403d9c33))

### refactor

* **js:** simplify package exports and add createBaseClient ([d7e1c97](https://github.com/Phala-Network/phala-cloud/commit/d7e1c976b61c8b7b0f127e2913c375e4d07d59c4))

## [0.1.1-beta.1](https://github.com/Phala-Network/phala-cloud/compare/js-v0.0.12...js-v0.1.1-beta.1) (2025-10-13)

### feat

* added client.extend ([3830d9c](https://github.com/Phala-Network/phala-cloud/commit/3830d9c1e9c9592fa4f84b2810386d0167285787))
* added new factory function createClient ([067a5bf](https://github.com/Phala-Network/phala-cloud/commit/067a5bfb4f09f84cc32ffc39068699b1e59d11d5))
* define_action accepts override return type ([d775fff](https://github.com/Phala-Network/phala-cloud/commit/d775fff2ae026555b8618c9bf97212b0fb81ffd1))
* **js:** added defineAction ([3953e3b](https://github.com/Phala-Network/phala-cloud/commit/3953e3bb7fbdf8d00e54655fd82c8a5378abd446))
* override return types for kms ([c00815b](https://github.com/Phala-Network/phala-cloud/commit/c00815b788d05d9f71d9d445df188e993a660747))

### fix

* broken type inference compatible ([1fcdea6](https://github.com/Phala-Network/phala-cloud/commit/1fcdea6f6d1a2214d1544d052914c52f1f337b9c))
* override return type for getCvmInfo ([87311f2](https://github.com/Phala-Network/phala-cloud/commit/87311f25b22adea6044d067f05b6ca887aa14790))
* type inference ([cb2a319](https://github.com/Phala-Network/phala-cloud/commit/cb2a3191f78b39dfc0e0f4b81370e0b900b59711))

### refactor

* get_current_user with defineAction ([6774c30](https://github.com/Phala-Network/phala-cloud/commit/6774c300a5546153c4311d38c608ceb3ace414e6))
* refcator all actions & typing ([db2fe40](https://github.com/Phala-Network/phala-cloud/commit/db2fe403881d49294afd0fa67a6981b0c3211bf2))
* reorganized action functions ([017c62c](https://github.com/Phala-Network/phala-cloud/commit/017c62c88ccd58df0f21c3f78c0f97fd7c567d68))
* **test:** consolidate action tests and reduce duplication ([99659bd](https://github.com/Phala-Network/phala-cloud/commit/99659bd4e383f2839ba22b344d47b6787d5e2239))

## [0.0.12](https://github.com/Phala-Network/phala-cloud/compare/57cb8ef05d2227ee6f9fb9135aa9f1ff5dfbd021...js-v0.0.12) (2025-10-11)

### doc

* add action functions development guide ([1637f68](https://github.com/Phala-Network/phala-cloud/commit/1637f685ec7d3465bec848cb308959fba3bae661))

### docs

* @phala/dstack-sdk 0.5.2 ([aee3b77](https://github.com/Phala-Network/phala-cloud/commit/aee3b770dd6131fa0c018188d57619ef7ee3c582))
* update action-functions-guide ([69ad4c9](https://github.com/Phala-Network/phala-cloud/commit/69ad4c9b0b0a51c578a2f2dbca0dc1a663bf0faf))
* update action-functions-guide ([d58e4fe](https://github.com/Phala-Network/phala-cloud/commit/d58e4feefab30438832f4090d5f6720b295d3ed7))

### feat

* **actions:** add_compose_hash ([f13e3ee](https://github.com/Phala-Network/phala-cloud/commit/f13e3eeb41024844a7fd4de0c39db5d3b1adb08c))
* **actions:** commit_cvm_compose_file_update ([1bc4acc](https://github.com/Phala-Network/phala-cloud/commit/1bc4acc28867de4ce1d3b45b90767db0447557eb))
* **actions:** commit_cvm_provision ([8dd5de4](https://github.com/Phala-Network/phala-cloud/commit/8dd5de41470e920834d3fd91bc42d7a6a024cfa2))
* **actions:** deploy_app_auth ([dffaec2](https://github.com/Phala-Network/phala-cloud/commit/dffaec229a8fbc8569a977d0aee336343d8f199e))
* **actions:** get_available_nodes ([598c3fb](https://github.com/Phala-Network/phala-cloud/commit/598c3fb310110ae9bc671e60d2f0a23cd4fa5909))
* **actions:** get_current_user ([45f8725](https://github.com/Phala-Network/phala-cloud/commit/45f8725fee5138263fb1b4e3e589440219f7f64f))
* **actions:** get_cvm_compose_file ([db69691](https://github.com/Phala-Network/phala-cloud/commit/db6969167756942b19d04d703b4a6d51b308ca08))
* **actions:** provision_cvm ([975e767](https://github.com/Phala-Network/phala-cloud/commit/975e76734deae234776886bea5e895dd42d89988))
* **actions:** provision_cvm_compose_file_update ([65f2058](https://github.com/Phala-Network/phala-cloud/commit/65f2058eb8a2db6fad308273a162bee8297d3900))
* add debug & debug logging ([00031a7](https://github.com/Phala-Network/phala-cloud/commit/00031a726eb2dfa15b2dcaf1f78884689ec25d03))
* added default_kms & kms_list to get_available_nodes & added example ([9ce56d5](https://github.com/Phala-Network/phala-cloud/commit/9ce56d510c46c79ee4af765dbe9b2fbd97f95a2f))
* added listInstanceTypes ([a21b36f](https://github.com/Phala-Network/phala-cloud/commit/a21b36fe698ea253d66a70eb094a098002ee8cb8))
* added support for browser scenario. ([d278f44](https://github.com/Phala-Network/phala-cloud/commit/d278f448b61cfbf6ca3da62d964a71371e7ca592))
* added update_env_vars flag for app compose update ([fc05423](https://github.com/Phala-Network/phala-cloud/commit/fc054238d1b92fb4762b0513cb3259efa5a52087))
* added x-phala-version to headers. ([754c313](https://github.com/Phala-Network/phala-cloud/commit/754c3136b86b4a69da974bc40d4257e83f6c29e6))
* apis for CVM deploy & update ([d9ee4a0](https://github.com/Phala-Network/phala-cloud/commit/d9ee4a08273d7966793ff07551a8706cd0c460e9))
* combined deploy & update in one example. ([955581b](https://github.com/Phala-Network/phala-cloud/commit/955581bcde0f20c14f1786efd7ec25d53afc7afc))
* cvm list & get info APIs ([300a04b](https://github.com/Phala-Network/phala-cloud/commit/300a04b32e11f3aea30a5cea5c63d4c94e1b91f1))
* **js:** env var support & test isolation for client config ([bd45b71](https://github.com/Phala-Network/phala-cloud/commit/bd45b71b48c94a5ae565c2378208b4b435140812))
* parse_dotenv ([0129f14](https://github.com/Phala-Network/phala-cloud/commit/0129f148131649d404fae825321332482a35ef9e))
* utils for deployment ([0756cb6](https://github.com/Phala-Network/phala-cloud/commit/0756cb6bbcde6d5edcd2afc765e3ccbd62148b53))
* workspace APIs. ([1ab4339](https://github.com/Phala-Network/phala-cloud/commit/1ab433915e5d38b2a528c7245eb4a84dc1ed86bf))

### fix

* add CvmLegacyDetailSchema for get_cvm_info ([24e91f7](https://github.com/Phala-Network/phala-cloud/commit/24e91f71b1160903af85990999972bc934a47340))
* add_compose_hash no more requires kmsContractAddress ([351e9ef](https://github.com/Phala-Network/phala-cloud/commit/351e9ef7084a3dddf95e9c30002c4892845badd8))
* added kms_id in provision cvm request ([2f381d4](https://github.com/Phala-Network/phala-cloud/commit/2f381d43d7c4e93515582ae1858c6c1a79a22b19))
* build error. ([5920500](https://github.com/Phala-Network/phala-cloud/commit/59205001edcd646ab410d1f5f5e878ed7112a8f2))
* export EnvVar type ([5c40572](https://github.com/Phala-Network/phala-cloud/commit/5c40572c14dc4224d0422b2dd68af84da20b07d3))
* inacccurate type for chain_id ([4fe4745](https://github.com/Phala-Network/phala-cloud/commit/4fe4745fdf9fe7248a64fd458f84b70e03be61cf))
* os image version can be x.y.z.{i} optionally. ([f8eb062](https://github.com/Phala-Network/phala-cloud/commit/f8eb0621f045e876927d1a026aa2d4e0fc8be2ba))
* test cases ([058548a](https://github.com/Phala-Network/phala-cloud/commit/058548add905a83a31126d6de55e835276e694a8))
* the kms_info is unexpected struct in cvm_info ([f410b81](https://github.com/Phala-Network/phala-cloud/commit/f410b81da4ce2cf63e37296b2063e9241b93a227))
* typing of CommitCvmComposeFileUpdateRequest ([fcb6b0b](https://github.com/Phala-Network/phala-cloud/commit/fcb6b0b92733dd4d6f53f6157666e4a4a2cc88c1))

### refactor

* Init JS SDK design. ([57cb8ef](https://github.com/Phala-Network/phala-cloud/commit/57cb8ef05d2227ee6f9fb9135aa9f1ff5dfbd021))
* allow customize RPC URL for deployAppAuth & addComposeHash ([ff9c5f9](https://github.com/Phala-Network/phala-cloud/commit/ff9c5f904daa8da050090e6138a238c9fa06e4be))
* allows app_id with 0x prefix ([b591c07](https://github.com/Phala-Network/phala-cloud/commit/b591c079105a517053a1c26d1759f64b16dccbdd))
* base Client ([ed3bdfc](https://github.com/Phala-Network/phala-cloud/commit/ed3bdfc8477e87be555a8b8a0779ed6ebbb86580))
* consistent name style for params. ([1cd44f8](https://github.com/Phala-Network/phala-cloud/commit/1cd44f8f443d7d9c6a78244b892376de5d3d7640))
* switch fetchInstance to protected that extend friendly. ([b228598](https://github.com/Phala-Network/phala-cloud/commit/b22859854b624863e12233e78ea83b6ee299d92b))
* tsconfig.json in the example ([7eb5096](https://github.com/Phala-Network/phala-cloud/commit/7eb5096af47252d76e99bf663ccba86a2ca9b2df))
* typing & tests ([eb25449](https://github.com/Phala-Network/phala-cloud/commit/eb25449d39f4f513a6e4038f6ad3937a47ba9758))
* typing for KmsInfo ([984ed28](https://github.com/Phala-Network/phala-cloud/commit/984ed284d90f82e63b2af83dd5c1478cf8c911f1))
* use same schema for app compose for loose restrction. ([41b1fcd](https://github.com/Phala-Network/phala-cloud/commit/41b1fcdaf6910d23066f96adaf09e4d1fbd9fbcd))
