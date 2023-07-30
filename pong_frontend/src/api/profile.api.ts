export async function getFriendProfile(userID:number, friendID:number)  {
	const response = await fetch('http://localhost:3000/friend/' + userID + '/friend/' + friendID);
    const json = (await response.json());
	return json;
  }

export async function getPrivateProfile(userID:number)  {
  const response = await fetch('http://localhost:3000/user/user/' + userID);
  const json = (await response.json());
return json;
}

export async function getPublicProfile(userID:number)  {
  const response = await fetch('http://localhost:3000/profile/public/' + userID, {credentials: "include",});
    const json = (await response.json());
  return json;
  }

export async function getMyID()  { //only for testing
  const response = await fetch('http://localhost:3000/profile/myID', {credentials: "include",});
  return response.text();
  }