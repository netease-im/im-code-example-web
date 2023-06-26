/**
 * 如何获取会话的头像以及名称。
 *
 * - p2p 会话的头像与名称来自于会话的另一个用户
 * - team 群组的头像与名称来自于群组的固有信息
 */
import store from '../store'


nim = NIM.getInstance({
  appKey: "YOUR_APPKEY",
  account: "YOUR_ACCOUNT",
  token: "YOUR_TOKEN",
  debug: true,
  onupdateuser: onupdateuser,
  onUpdateTeam: onUpdateTeam,
  onusers: onusers,
  onteams: onteams,
  /**
   * 注意，会话更新时，需要拉取会话的基本信息。
   */
  onsessions: onsessions,
  onupdatesessions: onupdatesessions,
});

/**
 * 收到 p2p 消息后触发 onupdateuser，参数为另一个用户的个人信息。
 *
 * 注意，不是每次 p2p 消息都会触发此回调，触发场景仅限于：
 * - 在线后，第一次收到另一用户的消息
 * - 另一用户更新个人信息后，再次发送消息
 */
function onupdateuser(user) {
  store.userProfiles[user.account] = user;
}

/**
 * 群信息更新。该回调函数的 team 仅包含更新的内容，所以要和已有的信息合并。
 */
function onUpdateTeam(team) {
  const tId = team.teamId;
  if (!store.teams[tId]) {
    // 本地不存在该群的信息
    fetchTeamInfo(tId);
  } else {
    // 更新信息和已有信息合并
    store.teams[tId] = {
      ...store.teams[tId],
      ...team,
    };
  }
}

/**
 * 初始化阶段，同步好友信息
 * user中包含:
 * - account: 用户名称
 * - nick：用户昵称
 * - avatar：用户头像
 */
function onusers(users) {
  for (const user of users) {
    store.userProfiles[user.account] = user;
  }
}

/**
 * 初始化阶段，同步群信息
 * team中包含:
 * - name: 群名称
 * - avatar: 群头像
 */
function onteams(teams) {
  for (const t of teams) {
    store.teams[t.teamId] = t;
  }
}


/**
 * 初始化同步获取会话列表后，更新会话对应的用户信息
 * 
 * 注意，这个回调其它的作用，比如会话列表的生成，会话列表的排序请参考其他的示例代码。这段代码仅展示如何获取会话的基本信息
 */
function onsessions(sessions) {
  /**
   * 参考[会话排序.js]。这里应该先排序，再获取会话的用户信息
   */

  /**
   * 获取用户信息。稍微间隔一些获取用户信息，减少初始化时期的页面加载压力
   */
  for (let i = 0; i < sessions.length; i++) {
    setTimeout(() => {
      updateSessionInfo(sessions[i])
    }, i * 100)
  }
}

/**
 * 每次更新 session 时，如果会话的基本信息不存在，可以去主动拉取
 * 
 * 注意，这个回调其它的作用，比如会话列表的生成，会话列表的排序请参考其他的示例代码。这段代码仅展示如何获取会话的基本信息
 */
function onupdatesessions(sessions) {
  for (const session of sessions) {
    updateSessionInfo(session)
  }
}

/**
 * 更新会话基本信息：头像、名称等
 *
 * 注意，该函数不是 NIM.getInstance 的回调函数。该函数应该在 onsessions, onupdatesessions 之后调用。
 * 
 * 它的作用是在会话有更新后，根据会话的类型(p2p, team)，拉取会话的基本信息（头像、昵称）
 */
function updateSessionInfo(session) {
  if (session.scene === "p2p") {
    if (!store.userProfiles[session.to]) {
      fetchUserInfo(session.to);
    }
  } else if (session.scene === "team") {
    if (!store.teams[session.to]) {
      fetchTeamInfo(session.to);
    }
  }
}

/**
 * 获取 p2p 会话对应的 user 信息。
 */
function fetchUserInfo(account) {
  nim.getUser({
    account,
    sync: true,
    done: function (err, user) {
      if (err) {
        console.error("获取用户信息失败", err);
      } else {
        store.userProfiles[user.account] = user;
      }
    },
  });
}

/**
 * 获取群会话对应的 team 信息。
 */
function fetchTeamInfo(teamId) {
  nim.getTeam({
    teamId,
    sync: true,
    done: function (err, team) {
      if (err) {
        console.error("获取群信息失败", err);
      } else {
        store.teams[team.teamId] = team;
      }
    },
  });
}




/**
 * 下面使用 React 的语法简单示意一下如何根据 store 中的信息绘制会话的基本信息
 */

class SessionList extends React.Component {
  render() {
    return store.orderedSessions.map((session) => {
      return <div key={session.id}>{this.renderSession(session)}</div>;
    });
  }

  renderSession(session) {
    let name;
    let avatar;
    switch (session.scene) {
      case "p2p":
        const user = store.userProfiles[session.to];
        name = user.nick || user.account;
        avatar = user.avatar || "default_image_url";
        break;
      case "team":
        const team = store.teams[session.to];
        team = team.name;
        avatar = team.avatar || "default_image_url";
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
