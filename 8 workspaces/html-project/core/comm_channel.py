# Inter-bot communication channel for HTML Project
import socket

class CommChannel:
    def __init__(self, host='localhost', port=9004):
        self.host = host
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def send(self, message):
        self.sock.sendto(message.encode(), (self.host, self.port))

    def receive(self):
        data, _ = self.sock.recvfrom(4096)
        return data.decode()
