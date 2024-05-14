/* eslint-disable default-case */
import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { IconSearch, IconArrowBack, IconKey, IconGridScan, IconAbc, IconBook, IconClockHour4, IconFileCheck, IconMoodSad } from '@tabler/icons-react';

function App() {
  const [chamadas, setChamadas] = useState(0);
  const [tuplas, setTuplas] = useState(10);
  const [chave, setChave] = useState("");
  const [formState, setFormState] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [dadosDoFill, setDadosDoFill] = useState();
  const [loadingFillData, setLoadingFillData] = useState(true);
  const [qtdRegs, setQtdRegs] = useState(100);

  const incrementarChamadas = () => {
    setChamadas(chamadas + 1)
  }

  const fetchData = () => {
    axios.post(`http://localhost:5051/api/hash/book/${qtdRegs}`)
      .then(response1 => {
        return axios.post("http://localhost:5051/api/hash/fill");
      })
      .then(response2 => {
        setDadosDoFill(response2.data);
        setLoadingFillData(false); // Set loading to false when data is fetched
      })
      .catch(error => {
        console.error("Erro ao fazer requisição: ", error);
        setLoadingFillData(false); // Handle error case and set loading to false
      });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      let requestData = {};
      let response;

      switch (formState) {
        case 1:
          response = await axios.get(
            `http://localhost:5051/api/hash/${chave}`
          );
          incrementarChamadas()
          break;
        case 2:
          requestData = { tuplas };
          response = await axios.get(
            `http://localhost:5051/api/hash/first/${tuplas}`
          );
          incrementarChamadas()
          break;
        default:
          return;
      }

      console.log(response.data);
      setResultado(response.data);
    } catch (error) {
      console.error("Erro ao fazer requisição: ", error);
      setResultado("error");
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          onSubmit(e);
        }}
      >
        <header>
          <nav>
            <h1>Query Process Simulator</h1>
          </nav>
        </header>
        <main className="main">
          <div className="title">
            <h2>Campos de busca</h2>
          </div>
          <section className="pesquisa">
            <div className="searchArrange">
              <input 
                type="number"
                value={qtdRegs}
                onChange = {(e) => setQtdRegs(e.target.value)}
              />
              <button 
                type="submit"
                onClick={() => fetchData()}
              >Carregar hash</button>
            </div>
            {formState !== 0 && (
              <div className="searchArrange">
                <div class="button-container">
                  <button type="submit">
                    <IconSearch />
                    Pesquisar
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </form>
    </div>
  );
}

export default App;
