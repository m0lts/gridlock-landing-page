import GridlockLogo from '../assets/logo-white.png'
import AppStoreButton from '../assets/app-store.svg'
import GooglePlayButton from '../assets/google-play.png'
import { useEffect, useState } from 'react';

export const Hero = () => {

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const drivers = [
        {
            firstName: 'Max',
            secondName: 'Verstappen',
            number: 1,
            image: 'https://media.api-sports.io/formula-1/drivers/25.png',
            color: '#3671C6'
        },
        {
            firstName: 'Charles',
            secondName: 'Leclerc',
            number: 16,
            image: 'https://media.api-sports.io/formula-1/drivers/34.png',
            color: '#E8022D'
        },
        {
            firstName: 'Lando',
            secondName: 'Norris',
            number: 4,
            image: 'https://media.api-sports.io/formula-1/drivers/49.png',
            color: '#FF8001'
        },
        {
            firstName: 'Oscar',
            secondName: 'Piastri',
            number: 81,
            image: 'https://media.api-sports.io/formula-1/drivers/97.png',
            color: '#FF8001'
        },
        {
            firstName: 'Carlos',
            secondName: 'Sainz Jr',
            number: 55,
            image: 'https://media.api-sports.io/formula-1/drivers/24.png',
            color: '#E8022D'
        },
        {
            firstName: 'Lewis',
            secondName: 'Hamilton',
            number: 44,
            image: 'https://media.api-sports.io/formula-1/drivers/20.png',
            color: '#29F4D2'
        },
        {
            firstName: 'Select',
            secondName: 'DRIVER',
            number: '--',
            color: '#fff'
        },
        {
            firstName: 'Select',
            secondName: 'DRIVER',
            number: '--',
            color: '#fff'
        },
        {
            firstName: 'Select',
            secondName: 'DRIVER',
            number: '--',
            color: '#fff'
        },
        {
            firstName: 'Select',
            secondName: 'DRIVER',
            number: '--',
            color: '#fff'
        },
    ]

    return (
        <section className="hero">
            <div className="hero-background" />
            <div className="hero-logo">
                <img src={GridlockLogo} alt="Gridlock Logo" style={{ width: 150, height: 150 }} />
            </div>
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: screenWidth > 768 ? 'repeat(2, 1fr)' : '', gridTemplateRows: screenWidth < 769 ? 'repeat(2, 1fr)' : ''}}>
                <div className="hero-left">
                    <h1 style={{ marginTop: screenWidth > 900 ? 100 : 50, textTransform: 'uppercase', fontSize: screenWidth > 400 ? 36 : 24, fontWeight: 700 }}>Predict F1 Races, Compete, And win Prizes.</h1>
                    <p style={{ marginTop: screenWidth < 400 ? 35 : 25, marginBottom: screenWidth < 400 ? 35 : 25 }}>Play with your friends in private leagues, compete against like-minded fans, or predict on a global scale. Everyone is in with a chance of winning weekly prizes on Gridlock.</p>
                    <div className="hero-app-buttons" style={{ display: 'flex', gap: screenWidth < 400 ? 10 : 20, }}>
                        <a href="https://apps.apple.com/app" target="_blank" rel="noopener noreferrer">
                            <img src={AppStoreButton} alt="Download on the App Store" style={{ width: screenWidth > 500 ? 150 : screenWidth > 350 ? 125 : 100 }} />
                        </a>
                        <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer">
                            <img src={GooglePlayButton} alt="Get it on Google Play" style={{ width: screenWidth > 500 ? 165 : screenWidth > 350 ? 135 : 105 }} />
                        </a>
                    </div>
                </div>
                <div className="hero-right">
                    <h2 style={{ textTransform: 'uppercase', fontSize: 18, textAlign: 'center'}}>Who would be in your top 10?</h2>
                    {drivers.map((driver, index) => (
                        <div key={index} className="prediction-item" style={{ border: `1px solid ${driver.color}`, backgroundColor: 'black', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: 55, gap: 10, marginTop: 10, }}>
                            <span style={{ fontSize: 20, fontWeight: 700, marginLeft: 15, textAlign: 'center', width: 25 }}>{driver.number}</span>
                            {driver.image && (
                                <img src={driver.image} alt={`${driver.lastName} Photo`} className="photo" style={{ width: 50, height: 50, justifySelf: 'flex-end' }} />
                            )}
                            <div className="name" style={{ display: 'flex', gap: 5, alignItems: 'flex-end'}}>
                                <span>{driver.firstName}</span>
                                <span style={{ textTransform: 'uppercase', fontWeight: '600'}}>{driver.secondName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}