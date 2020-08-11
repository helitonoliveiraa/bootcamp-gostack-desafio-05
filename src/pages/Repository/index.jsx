import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import api from '../../services/api';
import Container from '../../components/Container';

import {
  Loading,
  Owner,
  IssueList,
  ButtonContainer,
  ButtonPaginate,
} from './styles';

class Repository extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      filters: [
        { state: 'all', label: 'Todas', active: true },
        { state: 'open', label: 'Abertas', active: false },
        { state: 'closed', label: 'Fechadas', active: false },
      ],
      filterIndex: 0,
      limit: 5,
      page: 1,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const { filters, limit } = this.state;

    const repoName = decodeURIComponent(match.params.repo);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters.find(f => f.active).state,
          per_page: limit,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleLoad = async () => {
    const { match } = this.props;
    const { filters, filterIndex, page, limit } = this.state;

    const repoName = decodeURIComponent(match.params.repo);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: limit,
        page,
      },
    });

    this.setState({ issues: response.data });
  };

  handleClick = async filterIndex => {
    await this.setState({ filterIndex });
    this.handleLoad();
  };

  handlePage = async action => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });

    this.handleLoad();
  };

  render() {
    const {
      loading,
      issues,
      repository,
      filters,
      filterIndex,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando....</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar para home</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <ButtonContainer active={filterIndex}>
          {filters.map((fil, index) => (
            <button
              key={fil.label}
              type="button"
              onClick={() => this.handleClick(index)}
            >
              {fil.label}
            </button>
          ))}
        </ButtonContainer>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={label.id}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <ButtonPaginate page={page}>
          <button type="button" onClick={() => this.handlePage('back')}>
            Preveus
          </button>
          <button type="button" onClick={() => this.handlePage('next')}>
            Next
          </button>
        </ButtonPaginate>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repo: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Repository;
