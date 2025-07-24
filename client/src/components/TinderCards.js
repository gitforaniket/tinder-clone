import React, { useEffect, useState } from 'react';
import { CardSwiper } from 'react-card-swiper';
import './TinderCards.css';
import axios from './axios';

function TinderCards() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const req = await axios.get('/tinder/Cards');
      setPeople(req.data);
    }
    fetchData();
  }, []);

  const handleDismiss = (el, meta, id, action, operation) => {
    console.log('removing:', id, action, operation);
  };

  const handleEnter = (el, meta, id) => {
    console.log('entered:', id);
  };

  const handleFinish = (status) => {
    console.log('All cards finished:', status);
  };

  // Prepare data for CardSwiper
  const cardData = people.map((person) => ({
    id: person.name,
    imgUrl: person.imgUrl,
    name: person.name,
  }));

  return (
    <div className="tinderCards">
      <div className="tinderCards__cardContainer">
        <CardSwiper
          data={cardData}
          onDismiss={handleDismiss}
          onEnter={handleEnter}
          onFinish={handleFinish}
          renderCard={(card) => (
            <div
              style={{ backgroundImage: `url(${card.imgUrl})` }}
              className="card"
            >
              <h3>{card.name}</h3>
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default TinderCards;
