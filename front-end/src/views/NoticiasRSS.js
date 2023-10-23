import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../css/NoticiasRSS.css";

const NoticiasRSS = () => {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          "https://news.un.org/feed/subscribe/pt/news/topic/health/feed/rss.xml";
        const response = await axios.get(url);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        const noticiasArray = [];
        items.forEach((item) => {
          const titulo = item.querySelector("title").textContent;
          const link = item.querySelector("link").textContent;
          noticiasArray.push({ titulo, link });
        });

        setNoticias(noticiasArray);
      } catch (error) {
        console.error("Erro ao obter notícias RSS:", error);
      }
    };

    fetchData();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000, // Tempo para a próxima notícia (em milissegundos)
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {noticias.map((noticia, index) => (
          <div key={index} className="noticia">
            <a href={noticia.link} target="_blank" rel="noopener noreferrer">
              {noticia.titulo}
            </a>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default NoticiasRSS;
