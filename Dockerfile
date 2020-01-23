FROM quay.io/bitriseio/bitrise-base

RUN apt-get update
RUN apt-get -y install \
    ruby-dev \
    nodejs \
    liblzma-dev

RUN gem install -f bundler:2.1.4

COPY . /bitrise/src
WORKDIR /bitrise/src

RUN bundle install
RUN npm ci
