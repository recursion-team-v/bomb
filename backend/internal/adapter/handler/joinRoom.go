package controller

// type CreateRoomRequest struct {
// 	Username string `json:"username"`
// }

// type CreateRoomResponse struct {
// 	RoomId int `json:"roomId"`
// }

// type JoinRoomRequest struct {
// 	Username string `json:"username"`
// 	RoomId   int    `json:"roomId"`
// }

// type JoinRoomResponse struct {
// 	Error string `json:"error"`
// }

// type RoomManager struct {
// 	component.Base

// 	Rooms domain.RoomMap
// }

// func NewRoomManager() *RoomManager {
// 	return &RoomManager{
// 		Rooms: map[domain.RoomId]*domain.Room{},
// 	}
// }

// func (mgr *RoomManager) Create(s *session.Session, req *JoinRoomRequest) error {
// 	room := domain.NewRoom()
// 	return s.Response(CreateRoomResponse{RoomId: int(room.Id)})
// }

// // func (mgr *RoomManager) Join(s *session.Session, req *JoinRoomRequest) error {
// // 	room, found := mgr.Rooms[msg.RoomId]
// // }
