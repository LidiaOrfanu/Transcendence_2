import { fetchAddress } from "../../components/div/channel_div";
import { IUser } from "../../interfaces/interface";


export async function getUsers():  Promise<IUser[]> {
	try { 
    const response = await fetch(fetchAddress + 'user', {credentials: "include",});
    const json = await response.json();
	  return json as any[];
  } catch (error) {
    console.error('Error fetching Users:, error');
    return [];
  }
}


//to be tested
export async function getChannelUsers(channelId: number):  Promise<any[]> {
	const response = await fetch(fetchAddress + 'channel/' + channelId + '/users', {credentials: "include",});
  const json = await response.json();
	return json as any[];
}

//to be tested
export async function getChannelUser(userId: number, channelId: number): Promise<any> {
  if (userId === undefined || channelId === undefined) {
    throw new Error("Invalid userId or channelId");
  }
  try {
    const response = await fetch(fetchAddress + 'channel/' + userId + '/' + channelId + '/user', {credentials: "include",});

    if (!response.ok) {
      console.log("User is not Member of Channel");
      return false;
    }
    if (!response.headers.has("content-length")) {
      return false;
    }
    const json = await response.json();
    if(!json) {
      return false;
    }
    return json;
  } catch (error) {
      console.log("Error returning ChannelUser "+ userId + " of Channel "+ channelId + ":", error);
      return false;
  } 
}


export function deleteChannelUser(userId: number, channelId: number) {
    fetch(fetchAddress + 'channel/' + userId + '/' + channelId + '/user', {method: 'DELETE'})
      .then(response => response.json())
      .then(data => {console.log("ChannelUser" + userId + " deleted:", data);})
      .catch(error => {console.log("Error deleting ChannelUser " + userId + ":" , error);})
}
  
  //to be tested
  // adds a user to the Channeluser table of a channel with channelId
export async function postChannelUser(userId: number, channelId: number): Promise<void> {
    const requestOptions = {
      method: 'POST',
      headers: { 
        "Accept": "*/*",
        "Content-Type": "application/json"
      },
      body:  ''
    };
    fetch(fetchAddress + 'channel/' + userId +'/' + channelId, requestOptions)
      .then(response => {
        if (response.ok) {
          console.log("ChannelUser with UserId :" + userId +" added");
        } else {
          console.error("Error adding ChannelUser with UserId :" + userId +":", response.status);
          throw new Error ("Error adding ChannelUser");
        }
      })
      .catch(error => {
        console.error("Error adding ChannelUser with UserId :" + userId +":", error);
        throw error;
      });
}

export function postPrivateChannelUser(userId: number, channelId: number, password: string) {
  const requestOptions = {
    method: 'POST',
    headers: { 
      "Accept": "*/*",
      "Content-Type": "application/json"
    },
    body:  ''
  };
  return fetch(fetchAddress + 'channel/' + userId +'/' + channelId + '/' + password +  '/password', requestOptions)
  .then(response => {
    if (response.ok) {
      console.log("ChannelUser with UserId :" + userId +" added to private Channel");
    } else {
      console.error("Error adding ChannelUser with UserId :" + userId +":", response.status);
      throw new Error("Error adding ChannelUser");
    }
  })
  .catch(error => {
    console.error("Error adding ChannelUser with UserId :" + userId +":", error);
    throw error;
  });
}
  
  
  //Channel blocked Users
  // fetches all blocked users from Channel with ChannelId
export async function getChannelUsersBlocked(channelId: number):  Promise<any[]> {
      const response = await fetch(fetchAddress + 'channel/' + channelId + '/blockedUsers', {credentials: "include",});
    const json = await response.json();
      return json as any[];
}
  
  //to be tested
  // fetches a specific User with UserId from blcoked list of Channel with ChannelId
export async function getChannelUserBlocked(userId: number, channelId: number): Promise<any> {
    const response = await fetch(fetchAddress + 'channel/' + userId + '/' + channelId + '/blocked', {credentials: "include",});
    const json = await response.json();
    return json; 
}
  
  //works fine
export function deleteChannelUserBlocked(callerId: number, targetId: number, channelId: number) {
    return fetch(fetchAddress + 'channel/' + targetId + '/' + channelId + '/blocked', {method: 'DELETE'})
    .then(response => {
      if (!response.ok) {
        throw new Error('Request failed with status: ' + response.status);
      }
      return response.text();
    })
    .then(data => {
      console.log("ChannelUser " + targetId + " unblocked from Channel");
    })
    .catch(error => {
      console.log("Error allowing ChannelUser " + targetId + ":", error);
      alert("Error unbanning User");
    });
}
  
  //to be tested
export function postChannelUserBlocked(callerId: number, targetId: number, channelId: number) {
    const requestOptions = {
      method: 'POST',
      headers: { 
        "Accept": "*/*",
        "Container-Type": "application/json"
      },
      body:  ''
    };
    // /channel/{callerId}/{targetId}/{channelId}/blocked
    return fetch(fetchAddress + 'channel/' + callerId +'/' + targetId + '/' + channelId + '/blocked', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed with status: ' + response.status);
        }
        return response.text();
      })
      .then(data => {
        console.log("ChannelUser with UserId :" + targetId +" blocked");
      })
      .catch(error => {
        console.error("Error blocking ChannelUser with UserId :" + targetId +":", error);
        alert("Error banning User");
      });
}

//to be tested#
// checks if userId is on the list of blocked Users in Channel with ChannelId
// returns the User json, if blocked and false if not or an error occured
export async function getChannelBlockedUser(userId: number, channelId: number): Promise<any> {
    if (userId === undefined || channelId === undefined) {
      throw new Error("Invalid userId or channelId");
    }
    try {
      const response = await fetch(fetchAddress + 'channel/' + userId + '/' + channelId + '/blocked', {credentials: "include",});
  
      if (!response.ok) {
        console.error("Error retrieving blocked ChannelUser");
        return false;
      }
      if (!response.headers.has("content-length")) {
        return false;
      }
      const json = await response.json();
      if(!json) {
        return false;
      }
      return json;
    } catch (error) {
        console.log("Error returning blocked ChannelUser "+ userId + " of Channel "+ channelId + ":", error);
        return false;
    } 
}


export function postMuteUser(callerId: number, targetId: number, channelId: number, duration: number) {
  return new Promise<void>((resolve, reject) => {
    const requestOptions = {
        method: 'POST',
        headers: { 
          "Accept": "*/*",
          "Container-Type": "application/json"
        },
        body:  ''
      };
      fetch(fetchAddress + 'channel/' + callerId +'/' + targetId + '/' + channelId + '/mute/' + duration, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed with status: ' + response.status);
        }
        return response.text();
      })
      .then(data => {
        console.log("ChannelUser with UserId :" + targetId +" muted:");
        resolve();
      })
      .catch(error => {
        console.log("Error muting ChannelUser with UserId :" + targetId +":", error);
        reject(error);
      });  
    });  
  }
interface ApiResponseItem {
  CUserId: number;
  UserId: number;
  ChannelId: number;
  MutedUntil: string;
}

function hasUserId(array: ApiResponseItem[], targetUserId: number): boolean {
  return (array.some(item => item.UserId === targetUserId));
}

export async function getMutedStatus(channelId: number, targetId: number): Promise<boolean> {
  try {
    const response = await fetch(fetchAddress + 'channel/' + channelId + '/mutedusers', {credentials: "include",})
    if (!response.ok) {
      if (response.status === 400){
        return false;
      }
      // console.error("Error retrieving mute status");
      throw new Error("Error retrieving mute status");
    }
    if (!response.headers.has("content-length")) {
      return false;
    }
    const data = await response.json();
    if(!data) {
      return false;
    }
    const result = hasUserId(data, targetId);
    return result;
    // console.log(result);
  } catch (error) {
      console.log("Error retrieving mute status of User" + targetId + " in channel " + channelId + ":", error);
      return false;
  }
}


export async function getIsMuted(channelId: number, callerId: number, targetId: number): Promise<boolean> {
  try {
    const response = await fetch(fetchAddress + 'channel/' + callerId + '/' + targetId + '/' + channelId + '/mute', {credentials: "include",})
    if (!response.ok) {
      if (response.status === 400){
        return false;
      }
      // console.error("Error retrieving mute status");
      throw new Error("Error retrieving mute status");
    }
    if (!response.headers.has("content-length")) {
      return false;
    }
    const data = response.json();
    if(!data) {
      return false;
    }
    return true
  } catch (error) {
      console.log("Error retrieving mute status of User" + targetId + " in channel " + channelId + ":", error);
      return false;
  }
}


//Password protection

export function deleteChannelPassword(userId: number, channelId: number) {
  return fetch(fetchAddress + 'channel/' + userId + '/' + channelId + '/password', {method: 'DELETE'})
  .then(response => {
    if (response.ok) {
      console.log("ChannelPassword of Channel" + channelId + " was deleted");
    } else {
      console.error("Error deleting ChannelPassword of Channel" + channelId + ":", response.status);
    }
  })
  .catch(error => {
    console.error("Error deleting ChannelPassword of Channel:", error);
  });
}


export function putChannelPassword(userId: number, channelId: number, password: string) {
  const requestOptions = {
    method: 'PUT',
    headers: { 
      "Accept": "*/*",
      "Content-Type": "application/json"
    },
    body:  ''
  };
  return fetch(fetchAddress + 'channel/' + userId +'/' + channelId + '/' + password +  '/password', requestOptions)
  .then(response => {
    if (response.ok) {
      console.log("ChannelPassword of Channel" + channelId + " was changed");
    } else {
      console.error("Error changing ChannelPassword of Channel" + channelId + ":", response.status);
    }
  })
  .catch(error => {
    console.error("Error changing ChannelPassword of Channel:", error);
  });
}


// changes the Channeltype from public to private and the other way around
export function putChannelType(userId: number, channelId: number) {
  const requestOptions = {
    method: 'PUT',
    headers: { 
      "Accept": "*/*",
      "Content-Type": "application/json"
    },
    body:  ''
  };
  return fetch(fetchAddress + 'channel/' + userId +'/' + channelId + '/type', requestOptions)
  .then(response => {
    if (response.ok) {
      console.log("ChannelType of Channel " + channelId + " was changed");
    } else {
      console.error("Error changing ChannelType of Channel " + channelId + ": ", response.status);
    }
  })
  .catch(error => {
    console.error("Error changing ChannelType of Channel: ", error);
  });
}


//Blocked Users

export async function postBlockedUser(callerId: number, targetId: number): Promise<void> {
  const requestOptions = {
    method: 'POST',
    headers: { 
      "Accept": "*/*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "userId": callerId,
      "blockId": targetId.toString()
    })
  };
  fetch(fetchAddress + 'blocked/', requestOptions)
    .then(response => {
      if (response.ok) {
        console.log("ChannelUser with UserId :" + targetId +" blocked");
      } else {
        console.error("Error blocking User with UserId :" + targetId +":", response.status);
        // alert("Error blocking User: " + response);
        throw new Error ("Error blocking User");
      }
    })
    .catch(error => {
      console.error("Error blocking User with UserId :" + targetId +":", error);
      // alert("Error blocking User: " + error);
      throw error;
    });
}

export async function getBlockedUser(callerId: number, targetId: number): Promise<boolean> {
  const requestOptions = {
    method: 'GET',
    headers: { 
      "Accept": "*/*",
      "Content-Type": "application/json"
    }
  };
  return fetch(fetchAddress + 'blocked/'+ callerId + "/" + targetId, requestOptions)
    .then(response => response.json())
    .then(data => {
      if (data.hasOwnProperty('blockId')) {
        // console.log("ChannelUser with UserId :" + targetId +" blocked");
        return true;
      } else if (data.message === "No such blocked user") {
        return false;
      } else {
        console.error("Error blocking User with UserId :" + targetId +":", data.status);
        throw new Error ("Error blocking User");
      }
    })
    .catch(error => {
      console.error("Error blocking User with UserId :" + targetId +":", error);
      // alert("Error blocking User: " + error);
      throw error;
    });
}