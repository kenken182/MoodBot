import React from 'react';
import { render } from 'react-dom';

require('./styles.css');

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
  display: 'flex',
};

class CustomInput extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.state = {
      files: [],
    };
  }

  onChange(e) {
    var files = e.target.files;
    console.log(files);
    var filesArr = Array.prototype.slice.call(files);
    console.log(filesArr);
    this.setState({ files: [...this.state.files, ...filesArr] });
  }
  
  removeFile(f) {
       this.setState({ files: this.state.files.filter(x => x !== f) }); 
  }

  render() {
    return (
      <div style={styles}>
        <label className="custom-file-upload">
          <input type="file" multiple onChange={this.onChange} />
          <i className="fa fa-cloud-upload" /> Attach
        </label>
        {this.state.files.map(x => 
           <div className="file-preview" onClick={this.removeFile.bind(this, x)}>{x.name}</div>
         )}
      </div>
    );
  }
}

export default CustomInput