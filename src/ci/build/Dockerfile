# Build the combined docker image

ARG GIT_LOC=gitlab.com/imda_dsl/t2po
ARG TEST_ENGINE_TAG="checkpoint-20230224"
ARG PORTAL_TAG=main
ARG PLUGIN_WIDGET_TAG=main
ARG PLUGIN_ALGO_TAG=main

# Default branch shhould be main like the rest, but somehow it's master
ARG PLUGIN_WIDGET_TAG_DECORATOR=master

###########################################################
# Build stage for Node repos
###########################################################
FROM node:19.7-slim AS node-build
LABEL stage=node-build

WORKDIR /app

# Install Git
RUN apt update && apt install -y git

ARG GIT_LOC
ARG ACCESS_TOKEN
ARG PORTAL_TAG=main
ARG PLUGIN_WIDGET_TAG
ARG PLUGIN_WIDGET_TAG_DECORATOR

# Clone portal repos
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-portal/ai-verify-apigw.git --branch=fix-env-redis-db ./portal/ai-verify-apigw
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-portal/ai-verify-shared-library.git --branch=${PORTAL_TAG} ./portal/ai-verify-shared-library
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-portal/ai-verify-portal.git --branch=fix-nextjs-prod-build ./portal/ai-verify-portal

# Install dependencies and build each repo
WORKDIR /app/portal/ai-verify-shared-library
RUN npm install && npm run build
WORKDIR /app/portal/ai-verify-portal
#RUN npm link ../ai-verify-shared-library
#RUN mv .env.development .env.local
COPY ../env/portal.env .env.local
COPY --chmod=0755 ../script/start-all.sh .
#RUN bash -c 'chmod +x start-all.sh'
RUN npm install
RUN npm run build
WORKDIR /app/portal/ai-verify-apigw
COPY ../env/apigw.env .env
RUN npm install

# Clone widget & decorator plugins
WORKDIR /app
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.decorators.git  --branch=${PLUGIN_WIDGET_TAG_DECORATOR} ./widgets/decorators
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.fairness-metrics-toolbox-widgets.git  --branch=${PLUGIN_WIDGET_TAG} ./widgets/fairness-metrics-toolbox-widgets
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.process-checklist.git  --branch=${PLUGIN_WIDGET_TAG} ./widgets/process-checklist

# Install dependencies and build each repo
WORKDIR /app/widgets/decorators
RUN npm install && npm run zip
WORKDIR /app/widgets/fairness-metrics-toolbox-widgets
RUN npm install && npm run zip
WORKDIR /app/widgets/process-checklist
RUN npm install && npm run zip

WORKDIR /app
RUN apt-get install unzip

RUN mkdir -p ./plugins/widgets
RUN unzip ./widgets/decorators/aiverify.stock.decorators-*.zip -d ./plugins/widgets/decorator
RUN unzip ./widgets/fairness-metrics-toolbox-widgets/aiverify.stock.fairness-metrics-toolbox-widgets-*.zip -d ./plugins/widgets/fairness-metrics-toolbox
RUN unzip ./widgets/process-checklist/aiverify.stock.process-checklist-*.zip -d ./plugins/widgets/process-checklist


###########################################################
# Build stage for Python repos
###########################################################
#FROM python:3.10.10-slim AS python-build
FROM ubuntu:22.04 AS python-build
LABEL stage=python-build

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash -

# Install python 3.10
RUN apt update
RUN apt install -y python3.10
RUN python3 --version

# Install virtualenv
RUN apt install -y python3.10-venv

# Install Git
RUN apt install -y git

ARG GIT_LOC
ARG ACCESS_TOKEN
ARG TEST_ENGINE_TAG
ARG PLUGIN_ALGO_TAG

WORKDIR /app

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Clone test engine repos
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core.git --branch=${TEST_ENGINE_TAG} ./test-engine/test-engine-core
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-app.git --branch=${TEST_ENGINE_TAG} ./test-engine/test-engine-app

WORKDIR /app/test-engine/test-engine-core
RUN pip install -r requirements.txt

WORKDIR /app/test-engine/test-engine-app
RUN pip install -r requirements.txt
RUN pip install ../test-engine-core/dist/test_engine_core-1.0.0.tar.gz

# Create env file
#RUN echo CORE_MODULES_FOLDER=\"$PWD/core_modules\"\\n\
#VALIDATION_SCHEMAS_FOLDER=\"$PWD/test_engine_app/validation_schemas/\"\\n\
#REDIS_CONSUMER_GROUP=\"MyGroup\" \\n\
#REDIS_SERVER_HOSTNAME=\"redis\" \\n\
#REDIS_SERVER_PORT=6379 >> .env
COPY ../env/test-engine-app.env .env

WORKDIR /app

# CLone test engine core modules
# Serializers
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/joblibserializer.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/joblibserializer
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/pickleserializer.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/pickleserializer
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/tensorflowserializer.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/tensorflowserializer
# Models
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/lightgbmmodel.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/lightgbmmodel
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/openapimodel.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/openapimodel
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/sklearnmodel.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/sklearnmodel
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/xgboostmodel.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/xgboostmodel
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/tensorflowmodel.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/tensorflowmodel
# Data
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-test-engine/test-engine-core-modules/pandasdata.git --branch=$TEST_ENGINE_TAG ./test-engine/modules/pandasdata

WORKDIR /app/test-engine/modules
RUN find ./ -type f -name 'requirements.txt' -exec pip install -r "{}" \;

WORKDIR /app

# Clone stock algo plugins
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.algorithms.accumulated_local_effects.git --branch=${PLUGIN_ALGO_TAG} ./algos/accumulated_local_effects
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.algorithms.fairness_metrics_toolbox.git --branch=${PLUGIN_ALGO_TAG} ./algos/fairness_metrics_toolbox
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.algorithms.partial_dependence_plot.git --branch=${PLUGIN_ALGO_TAG} ./algos/partial_dependence_plot
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.algorithms.performance_metrics_toolbox.git --branch=${PLUGIN_ALGO_TAG} ./algos/performance_metrics_toolbox
RUN git clone https://oauth2:${ACCESS_TOKEN}@${GIT_LOC}/ai-verify/ai-verify-stock-plugins/aiverify.stock.algorithms.shap_toolbox.git --branch=${PLUGIN_ALGO_TAG} ./algos/shap_toolbox

# Unzip algos into plugins folder
RUN apt-get install unzip

RUN mkdir -p ./plugins/algos
RUN unzip ./algos/accumulated_local_effects/dist/*.zip -d ./plugins/algos/accumulated_local_effects
RUN unzip ./algos/fairness_metrics_toolbox/dist/*.zip -d ./plugins/algos/fairness_metrics_toolbox
RUN unzip ./algos/partial_dependence_plot/dist/*.zip -d ./plugins/algos/partial_dependence_plot
RUN unzip ./algos/performance_metrics_toolbox/dist/*.zip -d ./plugins/algos/performance_metrics_toolbox
RUN unzip ./algos/shap_toolbox/dist/*.zip -d ./plugins/algos/shap_toolbox

#RUN apt install -y jq
#
#WORKDIR /app/plugins/accumulated_local_effects
#RUN pip install -r requirements.txt
#RUN chmod +x ./deploy_plugin.sh
#RUN ./deploy_plugin.sh
#
#WORKDIR /app/plugins/fairness_metrics_toolbox
#RUN pip install -r requirements.txt
#RUN chmod +x ./deploy_plugin.sh
#RUN ./deploy_plugin.sh
#
#WORKDIR /app/plugins/partial_dependence_plot
#RUN pip install -r requirements.txt
#RUN chmod +x ./deploy_plugin.sh
#RUN ./deploy_plugin.sh
#
#WORKDIR /app/plugins/performance_metrics_toolbox
#RUN pip install -r requirements.txt
#RUN chmod +x ./deploy_plugin.sh
#RUN ./deploy_plugin.sh
#
#WORKDIR /app/plugins/shap_toolbox
#RUN pip install -r requirements.txt
#RUN chmod +x ./deploy_plugin.sh
#RUN ./deploy_plugin.sh

###########################################################
# Final stage
###########################################################
FROM ubuntu:22.04 AS final

# Install node v19.x
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash -
RUN apt-get update && apt-get install -y nodejs

# Install python 3.10
RUN apt update
RUN apt install -y python3.10
RUN python3 --version

WORKDIR /app

# Copy repos into final image

# Portal
COPY --from=node-build /app/portal/ai-verify-apigw ./portal/ai-verify-apigw
COPY --from=node-build /app/portal/ai-verify-portal ./portal/ai-verify-portal
COPY --from=node-build /app/portal/ai-verify-shared-library ./portal/ai-verify-shared-library

# Test engine
COPY --from=python-build /app/test-engine/test-engine-app ./test-engine/test-engine-app
COPY --from=python-build /app/test-engine/test-engine-core ./test-engine/test-engine-core

# Test engine core modules
COPY --from=python-build /app/test-engine/modules/joblibserializer ./test-engine/test-engine-app/core_modules/serializers/joblibserializer
COPY --from=python-build /app/test-engine/modules/pickleserializer ./test-engine/test-engine-app/core_modules/serializers/pickleserializer
COPY --from=python-build /app/test-engine/modules/tensorflowserializer ./test-engine/test-engine-app/core_modules/serializers/tensorflowserializer
COPY --from=python-build /app/test-engine/modules/lightgbmmodel ./test-engine/test-engine-app/core_modules/models/lightgbmmodel
COPY --from=python-build /app/test-engine/modules/openapimodel ./test-engine/test-engine-app/core_modules/models/openapimodel
COPY --from=python-build /app/test-engine/modules/sklearnmodel ./test-engine/test-engine-app/core_modules/models/sklearnmodel
COPY --from=python-build /app/test-engine/modules/xgboostmodel ./test-engine/test-engine-app/core_modules/models/xgboostmodel
COPY --from=python-build /app/test-engine/modules/tensorflowmodel ./test-engine/test-engine-app/core_modules/models/tensorflowmodel
COPY --from=python-build /app/test-engine/modules/pandasdata ./test-engine/test-engine-app/core_modules/data/pandasdata

COPY --from=python-build /app/plugins/algos ./portal/ai-verify-portal/plugins

COPY --from=python-build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY --from=node-build /app/plugins/widgets ./portal/ai-verify-portal/plugins

