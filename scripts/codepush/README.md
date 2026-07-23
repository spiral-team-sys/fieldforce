# Run release
source ./scripts_revopush/env.sh <app_key> <platform> <version_new>

# Signify
source ./scripts_revopush/env.sh signify all 0.1.4
source ./scripts_revopush/env.sh signify android 0.1.
source ./scripts_revopush/env.sh signify ios 0.1.3

# LGE
source ./scripts_revopush/env.sh lge TEST_android 1.3.9
source ./scripts_revopush/env.sh lge TEST_ios 1.3.9

source ./scripts_revopush/env.sh lge android 1.3.9
source ./scripts_revopush/env.sh lge ios 1.3.9
source ./scripts_revopush/env.sh lge all 1.3.9



