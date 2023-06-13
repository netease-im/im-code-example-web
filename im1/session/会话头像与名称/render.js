/**
 * 下面使用 React 的语法简单示意一下如何根据 store 中的信息绘制会话的基本信息
 */

class SessionList extends React.Component {
  render() {
    return store.nim.orderedSessions.map((session) => {
      return <div key={session.id}>{this.renderSession(session)}</div>;
    });
  }

  renderSession(session) {
    let name;
    let avatar;
    switch (session.scene) {
      case "p2p":
        const user = store.nim.users[session.to];
        name = user.nick || user.account;
        avatar = user.avatar || "default_image_url";
        break;
      case "team":
        const team = store.nim.teams[session.to];
        team = team.name;
        avatar = team.avatar || "default_image_url";
        break;
      case "superTeam":
        const superTeam = store.nim.superTeams[session.to];
        name = superTeam.name;
        avatar = superTeam.avatar || "default_image_url";
        break;
      default:
        break;
    }

    return (
      <div>
        <SessionCard avatar={avatar} name={name} />
      </div>
    );
  }
}
