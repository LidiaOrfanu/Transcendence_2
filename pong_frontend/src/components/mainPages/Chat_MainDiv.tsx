import React, { FC, useEffect, useState, useCallback, useMemo} from "react";
import { renderUser} from "../div/chat_utils"; 
import {ChatContainerStyle, BodyContainer, ChannelInfo, ChatPanel, Container, SideBar, TextBox } from "./ChatPageStyles";
import Channel_Div from '../div/channel_div';
import { ChannelAdmin_Buttons_Div, ChannelOwner_Buttons_Div } from "../div/channel_buttons_div";
import ChatBody_Div from "../div/channel_ChatBody_div";
import ChatInput_Div from "../div/channel_ChatPanel_div";
import { ChannelUserRoles, ChatName, ChatProps } from "../../interfaces/channel.interface";
import { chatInputProps } from "../div/channel_ChatPanel_div";
// import { main_div_mode_t } from "../MainDivSelector";
import { getUserIDByUserName } from "../div/channel_utils";
import { User } from "../../interfaces/user.interface";
import { postChannelUser } from "../../api/channel/channel_user.api";
import { WritableDraft, initialMessagesState, initializeMessagesState } from "./Arena_Chat";
import immer, { Draft } from "immer";

const Chat_MainDiv: FC<ChatProps> = (props) => {
	const [body, setBody] = useState<JSX.Element | null>(null);
	const [chatInput, setChatInput] = useState<JSX.Element | null>(null);
	const [channelpanel, setChannelpanel] = useState<JSX.Element | null>(null);
	const [loadingChannelpanel, setLoadingChannelpanel] = useState(true);
	const [channelPanelLoaded, setChannelPanelLoaded] = useState(false);

	//MESSAGES
	useEffect(() => {initializeMessagesState();},[]);

	const [messages, setMessages] = useState<{
		[key in ChatName]: { sender: string | undefined; content: string }[];
	}>(initialMessagesState);
		// console.log('initialMessageState:', initialMessagesState);

	const [message, setMessage] = useState("");

	function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		setMessage(e.target.value);
	}

	useEffect(() => {
    	setMessage(message.trim());
  	}, [message]);

	function sendMessage() {
		console.log("message:", message);
		console.log("Messages :", messages);
		console.log("currentchat: ", props.currentChat);
		console.log("username : ", props.user?.username);
		const payload = {
		content: message,
		to: props.currentChat.isChannel ? props.currentChat.chatName : props.currentChat.receiverId,
		sender: props.user?.username,
		chatName: props.currentChat.chatName,
		isChannel: props.currentChat.isChannel
		};

		props.socketRef.current?.emit("send message", payload);
		const newMessages = immer(messages, (draft: WritableDraft<typeof messages>) => {
		//if the element doesn't exist, an empty one will be added
		// console.log('Inside Immer callback');
			if(!draft[props.currentChat.chatName]) {
				draft[props.currentChat.chatName] = [];
			}
			draft[props.currentChat.chatName].push({
				sender: props.user?.username,
				content: message
			});
		});
		console.log('New Messages:', newMessages);
		setMessages(newMessages);
		setMessage("");
	}


		// const messages = useMemo(() =>
		// 	props.messages || [], [props.messages])

	function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter") {
		sendMessage();
		// setLocalMessage('');
		}
	}

	
	// currentRoles states and functions

	const [currentRoles, setCurrentRoles] = useState<ChannelUserRoles>({
		isUser: 			true,
		isUserResolved: 	true,
		isAdmin: 			false,
		isAdminResolved: 	true,
		isOwner:			false,
		isOwnerResolved:	true,
		isBlocked:			false,
		isBlockedResolved:	true,
		isMuted:			false,
		isMutedResolved:	true
	});

	function joinRoom(chatName: ChatName) {
		console.log("Posting User ", props.user?.userID, " in Channel:", props.currentChat.Channel.ChannelId);
		postChannelUser(props.user?.userID, props.currentChat.Channel.ChannelId)
			.then(()=> {
			props.socketRef.current?.emit("join room", chatName, (messages: any) => roomJoinCallback(messages, chatName))
			setCurrentRoles((prevState) => ({
				...prevState,
				isUser: true
			}))
			}).catch(error => {
				console.error("Error in joinRoom when adding User to Channel: ", error);
			});
	}

	function roomJoinCallback(incomingMessages: any, room: keyof typeof messages) {
		const newMessages = immer(messages, (draft: WritableDraft<typeof messages>) => {
			draft[room] = incomingMessages;
		});
		setMessages(newMessages);
	}

	function inviteButton(invitedPlayer: User | undefined){
		if( invitedPlayer) {
			if (!props.invitation.playerOneSocket ||
				 !props.invitation.playerTwoSocket ||
				 !props.invitation.sessionId) {
				props.invitation.playerOneSocket = props.user!.socketId;
				props.invitation.playerTwoSocket = invitedPlayer.socketId;
			}
			props.invitePlayer(props.invitation);
		}
		else 
			alert("Error while inviting Player. Please try again");
	}

	const renderChatInput = (chatInputProps: chatInputProps) => {
		return (
		  <ChatInput_Div {...chatInputProps} />
		);
	  };

	const handleBody = useCallback (() =>{
		setBody(<ChatBody_Div
			props = {props}
			messages={messages[props.currentChat.chatName]}
			joinRoom={joinRoom}
			ChannelUserRoles={currentRoles}
		/>);
	}, [messages, currentRoles]);

	const openFriend = (userName: string) => {
		getUserIDByUserName(userName)
		.then(result => {
			if (result !== undefined) {
				props.friend_set(result);
				// props.mode_set(main_div_mode_t.PUBLIC_PROFILE);
			}
		}).catch(error => {
			console.error("Error retrieving UserID:", error);
		})
	  };
	
	const handleChannelPanel = useCallback(() =>{
		setChannelpanel(
			loadingChannelpanel ? (
			  <div>Loading Channel Name...</div> // Show a loading spinner or placeholder
			) : (
			  <ChannelInfo>
				{props.currentChat.chatName}
				{/* <button onClick={() => props.leaveRoom(props.currentChat.chatName)}>
						Leave {props.currentChat.chatName}
					</button> */}
			  </ChannelInfo>
			)
		  );
		if (!props.currentChat.isChannel){
			setChannelpanel(
				loadingChannelpanel ? (
				  <div>Loading Channel Name...</div> // Show a loading spinner or placeholder
				) : (
				  <ChannelInfo>

					<div onClick={() => openFriend(props.currentChat.chatName.toString())}>
    					{props.currentChat.chatName}
  					</div>
					<div>
					<button onClick={() => inviteButton(props.allUsers.find(user => user.username === props.currentChat.chatName))}>
						Invite for a Game
					</button>
					<button onClick={() => props.addBlockedUser(props.currentChat.chatName)}>
						Block User
					</button>
					<button onClick={() => props.unblockUser(props.currentChat.chatName)}>
						Unblock User
					</button>
					<button onClick={() => props.addFriend(props.currentChat.chatName)}>
						Add as Friend
					</button>
					<button onClick={() => props.removeFriend(props.currentChat.chatName)}>
						Remove Friend
					</button>
					</div>
				  </ChannelInfo>
				)
			);
		}
		else if (currentRoles.isBlocked || currentRoles.isMuted) {
			setChannelpanel(
				loadingChannelpanel ? (
				  <div>Loading Channel Name...</div> // Show a loading spinner or placeholder
				) : (
				  <ChannelInfo>
					{props.currentChat.chatName}
					{/* <button onClick={() => props.leaveRoom(props.currentChat.chatName)}>
							Leave {props.currentChat.chatName}
						</button> */}
				  </ChannelInfo>
				)
			);
		}
		else if (currentRoles.isOwner){
			  setChannelpanel(
				  <ChannelOwner_Buttons_Div{...props} loadingChannelPanel={loadingChannelpanel}/>
			  );
		  }
		else if (currentRoles.isAdmin && currentRoles.isAdminResolved) {
			setChannelpanel(
				<ChannelAdmin_Buttons_Div{...props} loadingChannelPanel={loadingChannelpanel}/>
			);
		} 
		setChannelPanelLoaded(true);
	}, [
		currentRoles, 
		props.currentChat,
		loadingChannelpanel,
	]);

	useEffect(() => {
		setLoadingChannelpanel(false);
	}, [props.currentChat, props.currentChat.isResolved, messages]);

	useEffect(() => {
		if (channelPanelLoaded) {
		  setLoadingChannelpanel(false);
		}
	}, [channelPanelLoaded]);


	// useEffect(() => {
	// 	setChatInput(<ChatInput_Div props = {props}/>);
	// }, [props.currentChat, handleBody, handleChannelPanel, loadingChannelpanel, props.ChannelUserRoles, messages]);
	
	useEffect(() => {
		handleChannelPanel();
		handleBody();
		// setChatInput(<ChatInput_Div props = {props}/>);
	}, [props.currentChat, handleBody, handleChannelPanel, loadingChannelpanel, currentRoles]);

	return (
		<div style={ChatContainerStyle}>
			<SideBar>
				<Channel_Div{...props}/>
				<h3>All Users</h3>
				{props.allUsers.map((user) => renderUser(user, props))}
			</SideBar>
			<ChatPanel>
				<ChannelInfo>
					{channelpanel}
				</ChannelInfo>
				<BodyContainer>
				{body}
				</BodyContainer>
				{/* {chatInput}
				<TextBox
				value={props.message}
				onChange={props.handleMessageChange}
				onKeyPress={handleKeyPress}
				placeholder="You can write something here"
				/> */}
				{/* </BodyContainer> */}
				{renderChatInput({
					props: props,
					value: message,
					onChange: handleMessageChange,
					onKeyPress: handleKeyPress
				})}
			</ChatPanel>
		</div>
	);
};

export default Chat_MainDiv;