import React from 'react';
import { List } from 'semantic-ui-react';
import styled from 'styled-components';
import { Trie } from './Trie.js'
import { DictionaryStore } from './DictionaryStore.js'
import { MemoryRouter } from 'react-router-dom';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    width: 70%;
`;

const TextContainer = styled.div`
    display: flex;
    width: 70%;
    flex-direction: row;
    flex-wrap: wrap;
`;

const TextArea = styled.textarea`
    resize: vertical;
    flex: auto;
`;

const Display = styled.div`
    display: flex;
    width: 70%;
    flex-direction: row;
    flex-wrap: wrap;
`;

const Text = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const Annotation = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const LetterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 5px;
`;

const NewLineContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 5px;
    width: 100%;
`;

const Button = styled.button`
    margin: auto;
    margin-left: 5px;
`;

const NBSP = '\u00a0'

export class InputForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: ""
        };
    }

    handleChange= (e) =>{
        console.log(e)

        this.setState(
            {
                text: e.target.value
            },
            () => {
                console.log(this.state.text);
            },
        );
    }

    handleClick = (item, e) => {
        console.log(item)
        this.memory.push(item)
        console.log(e)
    }

    onButtonClick = (e) => {
        console.log("updateButton");
        console.log(this.state)
        this.props.onSubmit();
        console.log(e);
    }

    render() {
        return (
            <Container>
                {/* <TextContainer> */}
                    <TextArea onChange={this.handleChange} value={this.state.text}/>
                    <Button type="submit" onClick={this.onButtonClick}>Annotate</Button>
                {/* </TextContainer> */}
            </Container>
        );
    }
}
