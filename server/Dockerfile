FROM ubuntu:20.04

# Create app directory

WORKDIR /app
SHELL ["/bin/bash", "-c"] 

# Install required tools

RUN apt update
RUN apt install curl build-essential -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt -y install nodejs
RUN npm install pm2 near-cli -g
RUN apt-get -y install libclang-dev
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Check if cargo is visible and add  wasm32-unknown-unknown
RUN cargo --help
RUN rustup target add wasm32-unknown-unknown

COPY package*.json ./

RUN npm install


# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "pm2-runtime", "server.js" ]
