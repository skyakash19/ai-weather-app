import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineAudio, AiOutlineBulb, AiOutlineSend } from 'react-icons/ai';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSpeechSynthesis } from 'react-speech-kit';
import Lottie from 'lottie-react';
import weatherAnimation from './weat.json';
import './App.css';

const API_KEY = '71980305a2cf5536b27ba392e7c974c7'; // Replace with your actual API key

const WeatherApp = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [theme, setTheme] = useState('light');
    const { transcript, resetTranscript } = useSpeechRecognition();
    const { speak, voices } = useSpeechSynthesis();
    const femaleVoice = voices.find(voice => voice.name.includes('Female')) || voices[0];
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState('');
    const [isAiOpen, setIsAiOpen] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (transcript) {
            setCity(transcript);
            fetchWeather(transcript);
            resetTranscript();
        }
    }, [transcript]);

    const fetchWeather = async (cityName = city) => {
        if (!cityName) return;
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
            );
            setWeather(response.data);
            speak({
                text: `The weather in ${cityName} is ${response.data.weather[0].description} with a temperature of ${response.data.main.temp}°C`,
                voice: femaleVoice
            });
        } catch (error) {
            alert('City not found! Please enter a valid city name.');
        }
    };

    const handleVoiceSearch = () => {
        SpeechRecognition.startListening({ continuous: false });
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleAiToggle = () => {
        setIsAiOpen(!isAiOpen);
    };

    const handleAiInputChange = (e) => {
        setAiInput(e.target.value);
    };

    const handleAiSubmit = async () => {
        if (!aiInput.trim()) return;

        setAiMessages(messages => [...messages, { text: aiInput, sender: 'user' }]);
        const userMessage = aiInput;
        setAiInput('');

        try {
            const response = await axios.post('/ai-response', { question: userMessage });
            const aiResponse = response.data.response;

            setAiMessages(messages => [...messages, { text: aiResponse, sender: 'ai' }]);
            speak({ text: aiResponse, voice: femaleVoice });
        } catch (error) {
            setAiMessages(messages => [...messages, { text: 'Sorry, I encountered an error.', sender: 'ai' }]);
            console.error('AI Error:', error);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages]);

    return (
        <div className={`app-container ${theme}`}>
            <h1 className="title">☁️ AI Weather Dashboard</h1>
            <button className="theme-toggle" onClick={toggleTheme}>
                <AiOutlineBulb /> {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <button onClick={() => fetchWeather()}><FiSearch /></button>
                <button onClick={handleVoiceSearch}><AiOutlineAudio /></button>
            </div>

            {weather && (
                <div className="weather-info glass-card">
                    <h2>{weather.name}, {weather.sys.country}</h2>
                    <p>{weather.weather[0].description}</p>
                    <p>🌡 Temperature: {weather.main.temp}°C</p>
                    <p>💧 Humidity: {weather.main.humidity}%</p>
                    <Lottie animationData={weatherAnimation} className="weather-animation" style={{ width: 180, height: 180, margin: '0 auto' }} />
                </div>
            )}

            <button onClick={handleAiToggle} className="ai-assistant">
                🌟 Ask AI
            </button>

            {isAiOpen && (
                <div className="ai-chat">
                    <div className="ai-messages">
                        {aiMessages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                {message.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="ai-input">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={aiInput}
                            onChange={handleAiInputChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                        />
                        <button onClick={handleAiSubmit}><AiOutlineSend /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherApp;



//71980305a2cf5536b27ba392e7c974c7