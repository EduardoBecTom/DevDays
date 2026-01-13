import { getAllUsers, getUserById, createUser, deleteUser, updateUser } from '../services/user.service.js';
import { trace } from '@opentelemetry/api';
import { userCreationCounter } from '../otel.js';

const tracer = trace.getTracer('user-controller-tracer');

export const getUsers = async (req, res) => {
    const span = tracer.startSpan('getUsers');
    try {
        const users = await getAllUsers();
        span.setAttribute('user.count', users.length);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        span.end();
    }
};

export const getUser = (req, res) => {
    try {
        const { id } = req.params;
        const user = getUserById(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const addUser = (req, res) => {
    try {
        const newUser = createUser(req.body);
        res.status(201).json(newUser);
        userCreationCounter.add(1);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeUser = (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = deleteUser(id);
        if (deletedUser) {
            res.status(200).json(deletedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const modifyUser = (req, res) => {
    try{
        const {id} = req.params;
        const updatedUser = updateUser(id, req.body);
        if(updatedUser){
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
