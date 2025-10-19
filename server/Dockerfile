FROM golang:1.25

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o server

EXPOSE 8000

CMD ["./server"]
