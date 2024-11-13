import { useEffect, useState } from 'react';

export const Parallelograms = () => {

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <main className="parallelograms">
            <div className="banner-section" style={{ display: 'grid', gridTemplateColumns: '60% 40%', marginTop: 100 }}>
                <div className="text-side">
                    <h2>
                        WIN INCREDIBLE FORMULA 1 PRIZES
                    </h2>
                    <div className="parallelogram">
                        <p>The top 3 predictors of Gridlock 2025 will win a heap of awesome Formula 1 prizes!</p>
                    </div>
                </div>
                <div className="image-side">

                </div>
            </div>
            <div className="banner-section" style={{ display: 'grid', gridTemplateColumns: '40% 60%', marginTop: 100}}>
                <div className="image-side">

                </div>
                <div className="text-side">
                    <h2>
                        COMPETE AGAINST FRIENDS
                    </h2>
                    <div className="parallelogram left">
                        <p>Create and join private leagues - prove to your friends that you know the most about Formula 1.</p>
                    </div>
                </div>
            </div>
            <div className="banner-section" style={{ display: 'grid', gridTemplateColumns: '60% 40%', marginTop: 100}}>
                <div className="text-side">
                    <h2>
                        PRIZES TO BE WON EACH RACE WEEKEND
                    </h2>
                    <div className="parallelogram">
                        <p>On some race weekends prizes will be up for grabs for the best prediction - your chance to win your favourite team’s merch or unique experiences for free!</p>
                    </div>
                </div>
                <div className="image-side">

                </div>
            </div>
        </main>
    )
}