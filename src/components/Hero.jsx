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
            <header className="hero-logo">
                <img src={GridlockLogo} alt="Gridlock Logo" style={{ width: 150, height: 150 }} />
            </header>
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: screenWidth > 768 ? 'repeat(2, 1fr)' : '', gridTemplateRows: screenWidth < 769 ? 'repeat(2, 1fr)' : ''}}>
                <div className="hero-left" style={{ gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 2 }}>
                    <h1 style={{ marginTop: screenWidth > 900 ? 100 : 25, textTransform: 'uppercase', fontSize: screenWidth > 400 ? 36 : 24, fontWeight: 700 }}>Predict F1 Races, Compete, And win Prizes.</h1>
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
                {screenWidth > 768 && (
                    <div className="hero-right" style={{ gridColumnStart: 2, gridColumnEnd: 3, gridRowStart: 1, gridRowEnd: 3 }}>
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
                )}
                <div className="fantasy" style={{ gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <h2 style={{ marginTop: screenWidth > 900 ? 100 : 25, textTransform: 'uppercase', fontSize: screenWidth > 400 ? 36 : 24, fontWeight: 700, position: 'relative' }}>
                        <span style={{ position: 'relative', zIndex: 1 }}>FANTASY</span>
                        <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', color: 'red', zIndex: 2 }}>❌</span>
                    </h2>
                    <p style={{ marginTop: 10, textAlign: 'center', width: '70%' }}>Unlike traditional fantasy apps, Gridlock has no budget limits, no must-pick rules and no limitations. Just choose who you want, where you want them before qualifying starts.</p>

                </div>
            </div>
            <div className="banner-section" style={{ width: '100%', display: 'grid', gridTemplateColumns: '60% 40%', marginTop: 200 }}>
                <div className="text-side">
                    <h2 style={{ paddingLeft: 100, marginTop: 25, marginBottom: 25, fontSize: 36 }}>
                        WIN INCREDIBLE FORMULA 1 PRIZES
                    </h2>
                    <div className="parallelogram">
                        <p style={{ paddingLeft: 100, paddingTop: 20, paddingBottom: 20, paddingRight: 20, fontSize: 18, fontWeight: 500 }}>The top 3 of Gridlock 2025 will win a heap of awesome Formula 1 prizes!</p>
                    </div>
                </div>
                <div className="image-side">

                </div>
            </div>
            <div className="banner-section" style={{ width: '100%', display: 'grid', gridTemplateColumns: '40% 60%', marginTop: 200}}>
                <div className="image-side">

                </div>
                <div className="text-side">
                    <h2 style={{ paddingRight: 100, marginTop: 25, marginBottom: 25, fontSize: 36, textAlign: 'right' }}>
                        COMPETE AGAINST FRIENDS
                    </h2>
                    <div className="parallelogram left">
                        <p style={{ paddingLeft: 20, paddingTop: 20, paddingBottom: 20, paddingRight: 100, fontSize: 18, fontWeight: 500, textAlign: 'right' }}>Create and join private leagues - prove to your friends that you know the most about Formula 1.</p>
                    </div>
                </div>
            </div>
            <div className="banner-section" style={{ width: '100%', display: 'grid', gridTemplateColumns: '60% 40%', marginTop: 200, marginBottom: 200 }}>
                <div className="text-side">
                    <h2 style={{ paddingLeft: 100, marginTop: 25, marginBottom: 25, fontSize: 36 }}>
                        PRIZES TO BE WON EACH RACE WEEKEND
                    </h2>
                    <div className="parallelogram">
                        <p style={{ paddingLeft: 100, paddingTop: 20, paddingBottom: 20, paddingRight: 20, fontSize: 18, fontWeight: 500 }}>On some race weekends prizes will be up for grabs for the best prediction - your chance to win your favourite team’s merch or unique experiences for free!</p>
                    </div>
                </div>
                <div className="image-side">

                </div>
            </div>
            <footer style={{ width: '100%', backgroundColor: 'rgb(109, 109, 109)', paddingLeft: '10%', paddingRight: '10%', paddingTop: 30, paddingBottom: 30}}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <img src={GridlockLogo} alt="Gridlock Logo" style={{ width: 100, height: 100 }} />
                    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 25 }}>
                        <a href="#" style={{ color: 'white'}}>Support</a>
                        <a href="#" style={{ color: 'white'}}>Privacy Policy</a>
                        <a href="#" style={{ color: 'white'}}>Terms Of Use</a>
                    </nav>
                </div>
                <p style={{ marginTop: 15, marginBottom: 15 }}>This website is unofficial and is not associated in any way with the Formula One group of companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V. Gridlock is not affiliated with any of the drivers or teams displayed in our applications and such data is for informational purposes only.</p>
                <h4>&copy; 2024 Company 57 Limited. All rights reserved.</h4>
            </footer>
        </section>
    )
}