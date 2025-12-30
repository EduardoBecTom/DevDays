const users = [
    { id: "1", name: 'Alice' },
    { id: "2", name: 'Bob' },
];

export const getAllUsers = () => {
    return users;
};

export const getUserById = (id) => {
    const user = users.find(u => u.id === id);
    return user;
};

export const deleteUser = (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        const deletedUser = users.splice(index, 1);
        return deletedUser[0];
    }
    return null;
}

export const createUser = (user) => {
    const newUser = { id: Math.random().toString(36).slice(2), name: user.name };
    users.push(newUser);
    return newUser;
}

export const updateUser = (id, userData) =>{
    const user = users.find(u => u.id === id);
    if(user){
        user.name = userData.name || user.name;
        return user;
    }
}