document.addEventListener('DOMContentLoaded', () => {

    const caixaDeBusca = document.getElementById('caixaDeBusca');
    const botaoDeBusca = document.getElementById('botaoDeBusca');
    const resultadosDiv = document.getElementById('resultados'); 
    
    const btnNewBook = document.getElementById('btnNewBook');
    const formCont = document.getElementById('formCont');
    const bookForm = document.getElementById('bookForm');
    const formTitle = document.getElementById('formTitle');
    const btnCancel = document.getElementById('btnCancel');
    
    const bookIdInput = document.getElementById('bookId');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('authors');
    const genreInput = document.getElementById('genre');
    const yearInput = document.getElementById('year');
    
    const showAuthors = document.getElementById('showAuthors');
    
    const realizeSearch = () => { 
        const termo = caixaDeBusca.value;
    
        if (termo.length < 2) { 
            resultadosDiv.innerHTML = '<p>Digite pelo menos 2 caracteres para buscar.</p>';
            return;
        }
    
        fetch(`/api/livros/pesquisar?termo=${encodeURIComponent(termo)}`)
            .then(response => response.json())
            .then(livros => {
                showResults(livros);
            })
            .catch(error => {
                console.error('Erro ao buscar livros:', error);
                resultadosDiv.innerHTML = '<p>Ocorreu um erro ao realizar a busca. Tente novamente.</p>';
            });
    };
    
    const showResults = (livros) => { 
        resultadosDiv.innerHTML = ''; 
    
        if (livros.length === 0) {
            resultadosDiv.innerHTML = '<p>Nenhum livro encontrado para o termo buscado.</p>';
            return;
        }
    
        livros.forEach(livro => {
            const livroCard = document.createElement('div');
            livroCard.className = 'livro-card';
            livroCard.innerHTML = `
                <h3>${livro.titulo}</h3>
                <p><strong>Autor(es):</strong> ${livro.autores}</p>
                <p><strong>Gênero:</strong> ${livro.genero}</p>
                <p><strong>Ano:</strong> ${livro.ano_publicacao}</p>
                <button class="btn-editar" data-id="${livro.livro_id}">Editar</button>
                <button class="btn-excluir" data-id="${livro.livro_id}">Excluir</button>
            `;
            resultadosDiv.appendChild(livroCard);
            // Removida a linha que causava o erro
        });
    };
    
    const authorSearch = () => { 
        fetch('/api/autores')
            .then(response => response.json())
            .then(autores => {
                Authors(autores);
            })
            .catch(error => {
                console.error('Erro ao mostrar autores:', error);
                resultadosDiv.innerHTML = '<p>Ocorreu um erro ao realizar a busca. Tente novamente.</p>';
            });
    };
    
    const Authors = (autores) => { 
        resultadosDiv.innerHTML = ''; 
    
        if (autores.length === 0) {
            resultadosDiv.innerHTML = '<p>Nenhum autor cadastrado.</p>';
            return;
        }
    
        const authorsList = document.createElement('ul');
        authorsList.className = 'authors-list';
        autores.forEach(autor => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>Nome:</strong> ${autor.nome} | <strong>Nacionalidade:</strong> ${autor.nacionalidade}`;
            authorsList.appendChild(listItem);
        });
        resultadosDiv.appendChild(authorsList);
    };
    
    const showForm = (livro = null) => {
        formCont.classList.remove('hidden');
        if (livro) {
            formTitle.textContent = 'Editar Livro';
            bookIdInput.value = livro.livro_id;
            titleInput.value = livro.titulo;
            authorInput.value = livro.autores_ids;
            genreInput.value = livro.genero;
            yearInput.value = livro.ano_publicacao;
        } else {
            formTitle.textContent = 'Adicionar Novo Livro';
            bookForm.reset();
            bookIdInput.value = '';
        }
    };
    
    const hideForm = () => {
        formCont.classList.add('hidden');
        bookForm.reset();
        bookIdInput.value = '';
    };
    
    const saveBook = (event) => {
        event.preventDefault();
    
        const id = bookIdInput.value;
        const autores_ids = authorInput.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
        const dadosLivro = {
            titulo: titleInput.value,
            ano_publicacao: yearInput.value ? parseInt(yearInput.value) : null,
            genero: genreInput.value,
            autores_ids: autores_ids
        };
    
        const isEdicao = id !== '';
        const url = isEdicao ? `/api/livros/${id}` : '/api/livros';
        const method = isEdicao ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosLivro),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao salvar o livro.');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            hideForm();
            if (caixaDeBusca.value) {
                realizeSearch();
            }
        })
        .catch(error => {
            console.error('Erro ao salvar livro:', error);
            alert('Ocorreu um erro ao salvar. Verifique o console.');
        });
    };
    
    const editBook = (id) => {
        fetch(`/api/livros/${id}`)
            .then(response => response.json())
            .then(livro => {
                showForm(livro);
            })
            .catch(error => {
                console.error('Erro ao buscar dados do livro para edição:', error);
                alert('Não foi possível carregar os dados para edição.');
            });
    };
    
    const deleteBook = (id) => {
        if (!confirm('Tem certeza que deseja excluir este livro?')) {
            return;
        }
    
        fetch(`/api/livros/${id}`, {
            method: 'DELETE',
        })        
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            realizeSearch();
        })
        .catch(error => {
            console.error('Erro ao excluir livro:', error);
            alert('Ocorreu um erro ao excluir.');
        });
    };
    
    botaoDeBusca.addEventListener('click', realizeSearch);
    caixaDeBusca.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            realizeSearch();
        }
    });
    
    btnNewBook.addEventListener('click', () => showForm());
    btnCancel.addEventListener('click', hideForm);
    bookForm.addEventListener('submit', saveBook);
    showAuthors.addEventListener('click', authorSearch);
    
    resultadosDiv.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('btn-editar')) {
            const id = target.getAttribute('data-id');
            editBook(id);
        }
        if (target.classList.contains('btn-excluir')) {
            const id = target.getAttribute('data-id');
            deleteBook(id);
        }
    });
});
