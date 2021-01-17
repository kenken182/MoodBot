import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import './styles.css'
import Spinner from 'react-bootstrap/Spinner'
import Carousel from 'react-bootstrap/Carousel'

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
  display: 'flex',
};

const homeImageStyle = {
  marginLeft:'-350px',
  marginRight:'800px',
  marginBottom:'120px'
}

const fileInputStyle = {
  width: '120px',
  height: '120px',
  position: 'absolute',
  left: '150px', 
  top: '285px'
}

const buttonStyle = {
  backgroundColor: '#9BC3EB',
  border: 'none',
  fontSize: '40px',
  fontWeight: 'bold',
  width: '650px',
  position: 'absolute',
  top: '400px', 
  left: '125px'
} 

const textStyle = {
  backgroundColor: '#9BC3EB',
  border: 'none',
  fontSize: '20px',
  fontWeight: 'bold',
  width: '650px',
  position: 'absolute',
  top: '365px', 
  left: '370px'
}

const captionStyle = {
  position: 'static',
  color: '#545454'
}

const carouselStyle = {
  position: 'absolute', 
  top: '100px',
  left: '50px',
  height: '300px',
  width: '900px'
}

const goatStyle = {
  width: '300px', 
  height: '300px',
  bottom: '100px',
  right: '240px',
  position: 'relative'
}

const personStyle = {
  width: '120px', 
  height: '230px',
  bottom: '150px',
  right: '240px',
  position: 'relative'
}

const personTwoStyle = {
  width: '200px', 
  height: '300px',
  bottom: '200px',
  right: '240px',
  position: 'relative'
}

const catStyle = {
  width: '300px', 
  height: '200px',
  bottom: '70px',
  right: '200px',
  position: 'relative'
}
const divStyle = {
  left: '80px',
  top: '20px',
  position: 'relative'
}
const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);

  const submitFile = async () => {
    setLoading(true)
    try {
      if (!file) {
        setError(true);
        throw new Error('Select a file first!');
      }
      const formData = new FormData();
      formData.append('file', file[0]);
      const resOne = await axios.post(`http://localhost:3001/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const resTwo = await axios.post(`http://localhost:3001/analyze`, {
          headers: {
            'Content-Type': 'application/json',
          }, body: {
              'data': resOne.data,
          }
      })
      console.log(resTwo)
      const resThree = await axios.post(`http://localhost:3001/sentiment`, {
          headers: {
            'Content-Type': 'application/json',
          }, body: {
              'data': resTwo.data,
          }
      })
      setData(resThree.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  };
  if (data) { 
    console.log(data)
  }
  return (
    <Container>
      <Row>
        <Col xs={14} md={4}>
          <Image style={homeImageStyle} src="view.png"/>
        </Col>
        <Col xs={10} md={4}>
          {
          loading && 
            <Spinner style={fileInputStyle} animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          }
          {!loading && !data && 
            <div>
              <div style={styles}>
                <label className="custom-file-upload">
                  <input type="file" multiple 
                  onChange={(event) => {
                    setFile(event.target.files)
                    setFileName(event.target.files[0].name)
                  }} />
                  <Image style={fileInputStyle} src="cloud.png"/>
                </label>
                <div className="file-preview"/>
              </div>
              {file &&
                <div>
                  <div style={textStyle}> File Uploaded: {fileName} </div>
                </div>
              }
              <Button style={buttonStyle} onClick={submitFile}> Click here to analyze your audio! </Button>
            </div>
          }
          {data && 
            <Carousel style={carouselStyle}>
              <Carousel.Item>
                <Carousel.Caption style={captionStyle}>
                  <div style={divStyle}>
                    <h3>Sentiment</h3>
                    <p>Overall, your audio was {data.sentiment.overall}!</p>
                    <p>On average, your audio was {(data.sentiment.total / data.sentiment.length) * 100}% positive! </p>
                  </div>
                  <Image style={goatStyle} src="goat.png"/>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <Carousel.Caption style={captionStyle}>
                  <div style={divStyle}>
                    <h3>Opinions</h3>
                    <p style={{'fontWeight': 'bold'}}>The most notable opinions of your audio</p>
                    <div>
                      {data.sentiment.opinions.map(document => (
                        <p> {document.text} was a {document.sentiment} opinion and described as {document.opinionText} </p>
                      ))}
                    </div>
                  </div>
                  <Image style={personStyle} src="plataypus.png"/>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <Carousel.Caption style={captionStyle}>
                  <div style={divStyle}>
                    <h3>Emotions</h3>
                    <div>
                      {data.tone.document.map(docu => (
                        <p> This audio had a {Math.round((docu.score * 100))}% score for {docu.tone_name}</p>
                      ))}
                    </div>
                  </div>
                  <Image style={catStyle} src="cat.png"/>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <Carousel.Caption style={captionStyle}>
                  <div style={divStyle}>
                    <h3>Emotions</h3>
                    <p style={{'fontWeight': 'bold'}}>The most notable sentences of your audio</p>
                    <div>
                      {data.tone.sentence.map(sentences => (
                        <p> 
                        "{sentences.text}" had tones of {
                          sentences.tones.map(tone => (
                            <div>{tone.tone_id} </div>
                          ))
                        } 
                        </p>
                      ))}
                    </div>
                  </div>
                  <Image style={personTwoStyle} src="dog.png"/>
                </Carousel.Caption>
              </Carousel.Item>
            </Carousel>
          }
        </Col>
      </Row>
    </Container>
  );
};

export default FileUpload;