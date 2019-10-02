import React, { Component } from "react";

import Repository from "./Repository";

interface RepositoryType {
  id: string;
  name: string;
  organisation: string;
  vcsType: string;
}

interface RepositoriesProps {
  repositories: RepositoryType[];
  token: string;
}

interface RepositoriesState {
  expandedRepositoryId: string | undefined;
}

class Repositores extends Component<RepositoriesProps, RepositoriesState> {
  state: RepositoriesState = {
    expandedRepositoryId: undefined
  };

  togglePanel = (id: string) => {
    this.setState(({ expandedRepositoryId }) => ({
      expandedRepositoryId: expandedRepositoryId === id ? undefined : id
    }));
  };

  render() {
    const { repositories, token } = this.props;
    const { expandedRepositoryId } = this.state;

    return (
      <>
        {repositories.map(({ id, name, organisation, vcsType }) => (
          <Repository
            key={id}
            token={token}
            expanded={expandedRepositoryId === id}
            repository={{ id, name, organisation, vcsType }}
            onToggle={this.togglePanel}
          />
        ))}
      </>
    );
  }
}

export default Repositores;
