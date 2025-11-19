# 1.1.0-beta.11 (2025-11-19)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** expose full HTTP details in error handling ([1861230](https://github.com/Phala-Network/phala-cloud/commit/1861230ef96406b55b4a99e7228363fbb1ea5d98))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** resize command JSON output and E2E test reliability ([6733ec6](https://github.com/Phala-Network/phala-cloud/commit/6733ec618ee42e3c190b3696e432c47cd3736bd1))
* **cli:** resolve lint and type-check errors ([90d996f](https://github.com/Phala-Network/phala-cloud/commit/90d996f595c1c3b5d4aa21feefa2e5e01483c670))
* **cli:** restore v1.0.40 compatibility and add interface tests ([77d7e79](https://github.com/Phala-Network/phala-cloud/commit/77d7e79d0bb112fd10db7f1573cf059df888e03e))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* gateway domain maybe with port suffix ([0fc6332](https://github.com/Phala-Network/phala-cloud/commit/0fc633280ec47f6fb19f0f9ab48cf1cc5c7a6954))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* make sigstore happier ([58b8063](https://github.com/Phala-Network/phala-cloud/commit/58b8063f78a21cdd8e70a5985081d524fa789db6))
* remove cli's 250G limit of disk size ([3e914b2](https://github.com/Phala-Network/phala-cloud/commit/3e914b25b4a93a5450631ba1e0c203bc3e483474))
* remove non-existent error-handling import in ssh command ([59f33c1](https://github.com/Phala-Network/phala-cloud/commit/59f33c15efeeea68930d05aba445eb95c0728999))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* cli add customize ssh pubkey when deploy ([d9c8249](https://github.com/Phala-Network/phala-cloud/commit/d9c824904813d70ee2661b723c504f961ce95bd9))
* **cli:** add --json flag support to multiple commands ([1ea0c34](https://github.com/Phala-Network/phala-cloud/commit/1ea0c348bb5b7fb3d5db055a67dfb29b758fa4f3))
* **cli:** add --wait flag to deploy command for CVM updates ([b11f739](https://github.com/Phala-Network/phala-cloud/commit/b11f73982391fa1c46beef4f968cd8ad02dacbc2))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([89161d9](https://github.com/Phala-Network/phala-cloud/commit/89161d930321833abbb2f85fe2d93ae7619182f1))
* **cli:** added cp command ([4d320c5](https://github.com/Phala-Network/phala-cloud/commit/4d320c5ed07541200aa2a21f16b340afb7f3df2d))
* **cli:** inject project config resolver on cli startup ([4eb1f79](https://github.com/Phala-Network/phala-cloud/commit/4eb1f79384ef3a08dd06168baafc167f089989ae))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud/commit/11091c7845623de6fba20240764b610b451908aa))
* **cli:** skip API call in SSH command when gateway domain is provided ([73bf977](https://github.com/Phala-Network/phala-cloud/commit/73bf9776e7d3bd36d71d25a20a001cb64bf650f5))
* for ssh command also support read gateway port from phala.toml ([1360f9b](https://github.com/Phala-Network/phala-cloud/commit/1360f9b3d3cac4a2b6992bf54fc1948612127553))
* improve error handling for cli login ([b71b648](https://github.com/Phala-Network/phala-cloud/commit/b71b648c486059d157cb66f8ce99378467c6c3fe))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* only set ssh pubkey automatically on deploying ([c26a2e1](https://github.com/Phala-Network/phala-cloud/commit/c26a2e16438f8a7cb2569313cf50e42041146ba2))
* refine cvm_id parsing & loading for deploy & ssh command ([b2bb5a2](https://github.com/Phala-Network/phala-cloud/commit/b2bb5a21b146b0ceb3f424e6ef4fc6906ebb84f5))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.10 (2025-11-17)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** expose full HTTP details in error handling ([1861230](https://github.com/Phala-Network/phala-cloud/commit/1861230ef96406b55b4a99e7228363fbb1ea5d98))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** resize command JSON output and E2E test reliability ([6733ec6](https://github.com/Phala-Network/phala-cloud/commit/6733ec618ee42e3c190b3696e432c47cd3736bd1))
* **cli:** resolve lint and type-check errors ([90d996f](https://github.com/Phala-Network/phala-cloud/commit/90d996f595c1c3b5d4aa21feefa2e5e01483c670))
* **cli:** restore v1.0.40 compatibility and add interface tests ([77d7e79](https://github.com/Phala-Network/phala-cloud/commit/77d7e79d0bb112fd10db7f1573cf059df888e03e))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* gateway domain maybe with port suffix ([0fc6332](https://github.com/Phala-Network/phala-cloud/commit/0fc633280ec47f6fb19f0f9ab48cf1cc5c7a6954))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* make sigstore happier ([58b8063](https://github.com/Phala-Network/phala-cloud/commit/58b8063f78a21cdd8e70a5985081d524fa789db6))
* remove non-existent error-handling import in ssh command ([59f33c1](https://github.com/Phala-Network/phala-cloud/commit/59f33c15efeeea68930d05aba445eb95c0728999))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* cli add customize ssh pubkey when deploy ([d9c8249](https://github.com/Phala-Network/phala-cloud/commit/d9c824904813d70ee2661b723c504f961ce95bd9))
* **cli:** add --json flag support to multiple commands ([1ea0c34](https://github.com/Phala-Network/phala-cloud/commit/1ea0c348bb5b7fb3d5db055a67dfb29b758fa4f3))
* **cli:** add --wait flag to deploy command for CVM updates ([b11f739](https://github.com/Phala-Network/phala-cloud/commit/b11f73982391fa1c46beef4f968cd8ad02dacbc2))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([89161d9](https://github.com/Phala-Network/phala-cloud/commit/89161d930321833abbb2f85fe2d93ae7619182f1))
* **cli:** added cp command ([4d320c5](https://github.com/Phala-Network/phala-cloud/commit/4d320c5ed07541200aa2a21f16b340afb7f3df2d))
* **cli:** inject project config resolver on cli startup ([4eb1f79](https://github.com/Phala-Network/phala-cloud/commit/4eb1f79384ef3a08dd06168baafc167f089989ae))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud/commit/11091c7845623de6fba20240764b610b451908aa))
* **cli:** skip API call in SSH command when gateway domain is provided ([73bf977](https://github.com/Phala-Network/phala-cloud/commit/73bf9776e7d3bd36d71d25a20a001cb64bf650f5))
* for ssh command also support read gateway port from phala.toml ([1360f9b](https://github.com/Phala-Network/phala-cloud/commit/1360f9b3d3cac4a2b6992bf54fc1948612127553))
* improve error handling for cli login ([b71b648](https://github.com/Phala-Network/phala-cloud/commit/b71b648c486059d157cb66f8ce99378467c6c3fe))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* only set ssh pubkey automatically on deploying ([c26a2e1](https://github.com/Phala-Network/phala-cloud/commit/c26a2e16438f8a7cb2569313cf50e42041146ba2))
* refine cvm_id parsing & loading for deploy & ssh command ([b2bb5a2](https://github.com/Phala-Network/phala-cloud/commit/b2bb5a21b146b0ceb3f424e6ef4fc6906ebb84f5))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.9 (2025-11-13)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** expose full HTTP details in error handling ([1861230](https://github.com/Phala-Network/phala-cloud/commit/1861230ef96406b55b4a99e7228363fbb1ea5d98))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** resize command JSON output and E2E test reliability ([6733ec6](https://github.com/Phala-Network/phala-cloud/commit/6733ec618ee42e3c190b3696e432c47cd3736bd1))
* **cli:** resolve lint and type-check errors ([90d996f](https://github.com/Phala-Network/phala-cloud/commit/90d996f595c1c3b5d4aa21feefa2e5e01483c670))
* **cli:** restore v1.0.40 compatibility and add interface tests ([77d7e79](https://github.com/Phala-Network/phala-cloud/commit/77d7e79d0bb112fd10db7f1573cf059df888e03e))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* make sigstore happier ([58b8063](https://github.com/Phala-Network/phala-cloud/commit/58b8063f78a21cdd8e70a5985081d524fa789db6))
* remove non-existent error-handling import in ssh command ([59f33c1](https://github.com/Phala-Network/phala-cloud/commit/59f33c15efeeea68930d05aba445eb95c0728999))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* **cli:** add --json flag support to multiple commands ([1ea0c34](https://github.com/Phala-Network/phala-cloud/commit/1ea0c348bb5b7fb3d5db055a67dfb29b758fa4f3))
* **cli:** add --wait flag to deploy command for CVM updates ([b11f739](https://github.com/Phala-Network/phala-cloud/commit/b11f73982391fa1c46beef4f968cd8ad02dacbc2))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([89161d9](https://github.com/Phala-Network/phala-cloud/commit/89161d930321833abbb2f85fe2d93ae7619182f1))
* **cli:** added cp command ([4d320c5](https://github.com/Phala-Network/phala-cloud/commit/4d320c5ed07541200aa2a21f16b340afb7f3df2d))
* **cli:** inject project config resolver on cli startup ([4eb1f79](https://github.com/Phala-Network/phala-cloud/commit/4eb1f79384ef3a08dd06168baafc167f089989ae))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud/commit/11091c7845623de6fba20240764b610b451908aa))
* **cli:** skip API call in SSH command when gateway domain is provided ([73bf977](https://github.com/Phala-Network/phala-cloud/commit/73bf9776e7d3bd36d71d25a20a001cb64bf650f5))
* for ssh command also support read gateway port from phala.toml ([1360f9b](https://github.com/Phala-Network/phala-cloud/commit/1360f9b3d3cac4a2b6992bf54fc1948612127553))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* refine cvm_id parsing & loading for deploy & ssh command ([b2bb5a2](https://github.com/Phala-Network/phala-cloud/commit/b2bb5a21b146b0ceb3f424e6ef4fc6906ebb84f5))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.8 (2025-11-11)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** expose full HTTP details in error handling ([1861230](https://github.com/Phala-Network/phala-cloud/commit/1861230ef96406b55b4a99e7228363fbb1ea5d98))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** resize command JSON output and E2E test reliability ([6733ec6](https://github.com/Phala-Network/phala-cloud/commit/6733ec618ee42e3c190b3696e432c47cd3736bd1))
* **cli:** resolve lint and type-check errors ([90d996f](https://github.com/Phala-Network/phala-cloud/commit/90d996f595c1c3b5d4aa21feefa2e5e01483c670))
* **cli:** restore v1.0.40 compatibility and add interface tests ([77d7e79](https://github.com/Phala-Network/phala-cloud/commit/77d7e79d0bb112fd10db7f1573cf059df888e03e))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* make sigstore happier ([58b8063](https://github.com/Phala-Network/phala-cloud/commit/58b8063f78a21cdd8e70a5985081d524fa789db6))
* remove non-existent error-handling import in ssh command ([59f33c1](https://github.com/Phala-Network/phala-cloud/commit/59f33c15efeeea68930d05aba445eb95c0728999))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* **cli:** add --json flag support to multiple commands ([1ea0c34](https://github.com/Phala-Network/phala-cloud/commit/1ea0c348bb5b7fb3d5db055a67dfb29b758fa4f3))
* **cli:** add --wait flag to deploy command for CVM updates ([b11f739](https://github.com/Phala-Network/phala-cloud/commit/b11f73982391fa1c46beef4f968cd8ad02dacbc2))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([89161d9](https://github.com/Phala-Network/phala-cloud/commit/89161d930321833abbb2f85fe2d93ae7619182f1))
* **cli:** inject project config resolver on cli startup ([4eb1f79](https://github.com/Phala-Network/phala-cloud/commit/4eb1f79384ef3a08dd06168baafc167f089989ae))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud/commit/11091c7845623de6fba20240764b610b451908aa))
* **cli:** skip API call in SSH command when gateway domain is provided ([73bf977](https://github.com/Phala-Network/phala-cloud/commit/73bf9776e7d3bd36d71d25a20a001cb64bf650f5))
* for ssh command also support read gateway port from phala.toml ([1360f9b](https://github.com/Phala-Network/phala-cloud/commit/1360f9b3d3cac4a2b6992bf54fc1948612127553))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* refine cvm_id parsing & loading for deploy & ssh command ([b2bb5a2](https://github.com/Phala-Network/phala-cloud/commit/b2bb5a21b146b0ceb3f424e6ef4fc6906ebb84f5))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.7 (2025-11-11)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** expose full HTTP details in error handling ([1861230](https://github.com/Phala-Network/phala-cloud/commit/1861230ef96406b55b4a99e7228363fbb1ea5d98))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** resize command JSON output and E2E test reliability ([6733ec6](https://github.com/Phala-Network/phala-cloud/commit/6733ec618ee42e3c190b3696e432c47cd3736bd1))
* **cli:** resolve lint and type-check errors ([90d996f](https://github.com/Phala-Network/phala-cloud/commit/90d996f595c1c3b5d4aa21feefa2e5e01483c670))
* **cli:** restore v1.0.40 compatibility and add interface tests ([77d7e79](https://github.com/Phala-Network/phala-cloud/commit/77d7e79d0bb112fd10db7f1573cf059df888e03e))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* make sigstore happier ([58b8063](https://github.com/Phala-Network/phala-cloud/commit/58b8063f78a21cdd8e70a5985081d524fa789db6))
* remove non-existent error-handling import in ssh command ([59f33c1](https://github.com/Phala-Network/phala-cloud/commit/59f33c15efeeea68930d05aba445eb95c0728999))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* **cli:** add --json flag support to multiple commands ([1ea0c34](https://github.com/Phala-Network/phala-cloud/commit/1ea0c348bb5b7fb3d5db055a67dfb29b758fa4f3))
* **cli:** add --wait flag to deploy command for CVM updates ([b11f739](https://github.com/Phala-Network/phala-cloud/commit/b11f73982391fa1c46beef4f968cd8ad02dacbc2))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([89161d9](https://github.com/Phala-Network/phala-cloud/commit/89161d930321833abbb2f85fe2d93ae7619182f1))
* **cli:** inject project config resolver on cli startup ([4eb1f79](https://github.com/Phala-Network/phala-cloud/commit/4eb1f79384ef3a08dd06168baafc167f089989ae))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud/commit/11091c7845623de6fba20240764b610b451908aa))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* refine cvm_id parsing & loading for deploy & ssh command ([b2bb5a2](https://github.com/Phala-Network/phala-cloud/commit/b2bb5a21b146b0ceb3f424e6ef4fc6906ebb84f5))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.6 (2025-11-11)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** expose full HTTP details in error handling ([1861230](https://github.com/Phala-Network/phala-cloud/commit/1861230ef96406b55b4a99e7228363fbb1ea5d98))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** resize command JSON output and E2E test reliability ([6733ec6](https://github.com/Phala-Network/phala-cloud/commit/6733ec618ee42e3c190b3696e432c47cd3736bd1))
* **cli:** resolve lint and type-check errors ([90d996f](https://github.com/Phala-Network/phala-cloud/commit/90d996f595c1c3b5d4aa21feefa2e5e01483c670))
* **cli:** restore v1.0.40 compatibility and add interface tests ([77d7e79](https://github.com/Phala-Network/phala-cloud/commit/77d7e79d0bb112fd10db7f1573cf059df888e03e))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* make sigstore happier ([58b8063](https://github.com/Phala-Network/phala-cloud/commit/58b8063f78a21cdd8e70a5985081d524fa789db6))
* remove non-existent error-handling import in ssh command ([59f33c1](https://github.com/Phala-Network/phala-cloud/commit/59f33c15efeeea68930d05aba445eb95c0728999))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* **cli:** add --json flag support to multiple commands ([1ea0c34](https://github.com/Phala-Network/phala-cloud/commit/1ea0c348bb5b7fb3d5db055a67dfb29b758fa4f3))
* **cli:** add --wait flag to deploy command for CVM updates ([b11f739](https://github.com/Phala-Network/phala-cloud/commit/b11f73982391fa1c46beef4f968cd8ad02dacbc2))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([89161d9](https://github.com/Phala-Network/phala-cloud/commit/89161d930321833abbb2f85fe2d93ae7619182f1))
* **cli:** inject project config resolver on cli startup ([4eb1f79](https://github.com/Phala-Network/phala-cloud/commit/4eb1f79384ef3a08dd06168baafc167f089989ae))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud/commit/11091c7845623de6fba20240764b610b451908aa))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* refine cvm_id parsing & loading for deploy & ssh command ([b2bb5a2](https://github.com/Phala-Network/phala-cloud/commit/b2bb5a21b146b0ceb3f424e6ef4fc6906ebb84f5))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.4 (2025-11-11)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud-cli/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud-cli/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud-cli/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud-cli/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud-cli/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud-cli/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud-cli/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud-cli/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud-cli/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud-cli/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud-cli/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud-cli/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud-cli/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud-cli/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([76467cd](https://github.com/Phala-Network/phala-cloud-cli/commit/76467cd0344386302092117b2aa2efe3dc10ff7b))
* **cli:** inject project config resolver on cli startup ([09e7cd9](https://github.com/Phala-Network/phala-cloud-cli/commit/09e7cd9cfaf89528c6971b160da6a8fdf4691c01))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud-cli/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud-cli/commit/11091c7845623de6fba20240764b610b451908aa))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud-cli/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud-cli/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud-cli/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* refine cvm_id parsing & loading for deploy & ssh command ([bef2a54](https://github.com/Phala-Network/phala-cloud-cli/commit/bef2a54272446c03ed89cbe408cab2ff065580f4))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud-cli/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.3 (2025-11-11)


### Bug Fixes

* CLI error handling to expose full HTTP details ([e74eb37](https://github.com/Phala-Network/phala-cloud-cli/commit/e74eb377a276ae0cbb0c4521b893f92330861cce))
* **cli:** adapt error-handling to new SDK error types ([0ab651b](https://github.com/Phala-Network/phala-cloud-cli/commit/0ab651b78677632d815eeaf7a5e4e2ffeb0892cb))
* **cli:** improve non-interactive mode and JSON output ([9e9e2e2](https://github.com/Phala-Network/phala-cloud-cli/commit/9e9e2e236e00995ba23c4f3e30f2211ba9388b28))
* **cli:** mark 6 fields as nullable in CVM schemas ([80f5230](https://github.com/Phala-Network/phala-cloud-cli/commit/80f523056e967e099a438f5a9a013435e0675b44))
* **cli:** schema validation and automation improvements ([83924e1](https://github.com/Phala-Network/phala-cloud-cli/commit/83924e1c180e4ee72f285c5dcf79f8c36962e69e))
* compatible to latest sdk ([cf418e4](https://github.com/Phala-Network/phala-cloud-cli/commit/cf418e449b3bc6417abc50455ddd448f11360069))
* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud-cli/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud-cli/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud-cli/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud-cli/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud-cli/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud-cli/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* added phala.toml support ([e02c130](https://github.com/Phala-Network/phala-cloud-cli/commit/e02c1307790066f0de4e2d9913acb8ebb5ab6650))
* **cli:** add --wait flag to deploy command for CVM updates ([bf0f85a](https://github.com/Phala-Network/phala-cloud-cli/commit/bf0f85ae5c519cf11a81345be2aa0c391130c72b))
* **cli:** added command ssh ([76467cd](https://github.com/Phala-Network/phala-cloud-cli/commit/76467cd0344386302092117b2aa2efe3dc10ff7b))
* **cli:** inject project config resolver on cli startup ([09e7cd9](https://github.com/Phala-Network/phala-cloud-cli/commit/09e7cd9cfaf89528c6971b160da6a8fdf4691c01))
* **cli:** open browser & login workflow ([2b56074](https://github.com/Phala-Network/phala-cloud-cli/commit/2b560742b9e6f9e1d3f1da173d3d05e6feac880e))
* **cli:** retry on http 409 ([11091c7](https://github.com/Phala-Network/phala-cloud-cli/commit/11091c7845623de6fba20240764b610b451908aa))
* improve error message & fix linting ([cc177ff](https://github.com/Phala-Network/phala-cloud-cli/commit/cc177ff923a499fee05b9f18fc3199bf2569a66e))
* move auth login to login and added deprecated warning ([dd1c096](https://github.com/Phala-Network/phala-cloud-cli/commit/dd1c096208e2dd81623a8c6e730bef4a9a780770))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud-cli/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* refine cvm_id parsing & loading for deploy & ssh command ([bef2a54](https://github.com/Phala-Network/phala-cloud-cli/commit/bef2a54272446c03ed89cbe408cab2ff065580f4))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud-cli/commit/ed60eecc66056868debb23f51937c71014020c0a))



# 1.1.0-beta.2 (2025-10-13)


### Bug Fixes

* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud-cli/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* skip start/stop/restart response schema ([5bbc953](https://github.com/Phala-Network/phala-cloud-cli/commit/5bbc9532ae1ac19ee8ce027892ff9dc79d03806e))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud-cli/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud-cli/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud-cli/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* add CLI completion support ([37dc21b](https://github.com/Phala-Network/phala-cloud-cli/commit/37dc21b14bb7377bbdefd35c9663bf0a74bda4ab))
* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud-cli/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))
* show help message as default behavior ([ed60eec](https://github.com/Phala-Network/phala-cloud-cli/commit/ed60eecc66056868debb23f51937c71014020c0a))



## 1.0.39 (2025-10-13)


### Bug Fixes

* kms list item types ([31bef68](https://github.com/Phala-Network/phala-cloud-cli/commit/31bef689027e99fab0eca83516cd4a1385d30a61))
* the built artifact should bundled @phala/cloud as well ([c47324e](https://github.com/Phala-Network/phala-cloud-cli/commit/c47324e55d51c5f0ba372cebdb5b9255a24ab8b3))
* the envs not update with deploy command ([1d23a32](https://github.com/Phala-Network/phala-cloud-cli/commit/1d23a32f11e8fb1e8baf71171dc1dfd597ab4da5))
* typing. ([3da96ab](https://github.com/Phala-Network/phala-cloud-cli/commit/3da96ab02195d6bb2b436491a81aee9449f77c75))


### Features

* no spinner for json mode ([9daf848](https://github.com/Phala-Network/phala-cloud-cli/commit/9daf848a1d082d9531b7c0d7d7fd6f2ab0d5ba40))



