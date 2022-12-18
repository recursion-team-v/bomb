package domain

import "math/rand"

type Room struct {
	// ルーム ID
	Id RoomId
}

type RoomId int
type RoomMap map[RoomId]*Room

func NewRoom() *Room {
	return &Room{
		Id: RoomId(rand.Int31n(100000)), // TODO
	}
}
