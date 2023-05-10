import NIM from "@yxim/nim-web-sdk/dist/SDK/NIM_Web_NIM.js";
/**
 * 你的数据存放文件。更新数据后，记得要更新 UI
 */
import store from "./your_store_file";

nim = NIM.getInstance({
  appKey: "YOUR_APPKEY",
  account: "YOUR_ACCOUNT",
  token: "YOUR_TOKEN",
  onupdateuser: onupdateuser,
  onUpdateTeam: onUpdateTeam,
  onUpdateSuperTeam: onUpdateSuperTeam,
  onusers: onusers,
  onteams: onteams,
  onSuperTeams: onSuperTeams,
  /**
   * 注意，会话更新时，需要拉取会话的基本信息。
   */
  // onsessions: onsessions,
  // onupdatesessions: onupdatesessions,
});

/**
 * 收到 p2p 消息后触发 onupdateuser，参数为另一个用户的个人信息。
 *
 * 注意，不是每次 p2p 消息都会收到，收到仅限于：
 * - 在线后，第一次收到另一用户的消息
 * - 另一用户更新个人信息后，再次发送消息
 */
function onupdateuser(user) {
  store.nim.users[user.account] = user;
}

/**
 * 群信息更新
 */
function onUpdateTeam(team) {
  const tId = team.teamId;
  if (!store.nim.teams[tId]) {
    updateTeamInfo(tId);
  } else {
    store.nim.teams[tId] = {
      ...store.nim.teams[tId],
      ...team,
    };
  }
}

/**
 * 超级群消息更新
 */
function onUpdateSuperTeam(team) {
  const tId = team.teamId;
  if (!store.nim.superTeams[tId]) {
    updateSuperTeamInfo(tId);
  } else {
    store.nim.superTeams[tId] = {
      ...store.nim.superTeams[tId],
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
    store.nim.users[user.account] = user;
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
    store.nim.teams[t.teamId] = t;
  }
}

/**
 * 初始化阶段，同步超级群信息
 * superTeam中包含:
 * - name: 群名称
 * - avatar：群头像
 */
function onSuperTeams(teams) {
  for (const t of teams) {
    store.nim.superTeams[t.teamId] = t;
  }
}

/**
 * 更新会话基本信息：头像、名称等
 *
 * 调用时机：onsessions, onupdatesessions 回调函数中
 */
function updateSessionInfo(session) {
  if (session.scene === "p2p") {
    if (!store.nim.users[session.to]) {
      updateUserInfo(session.to);
    }
  } else if (session.scene === "team") {
    if (!store.nim.teams[session.to]) {
      updateTeamInfo(session.to);
    }
  } else if (session.scene === "superTeam") {
    if (!store.nim.superTeams[session.to]) {
      updateSuperTeamInfo(session.to);
    }
  }
}

/**
 * 获取 p2p 会话对应的 user 信息。
 */
function updateUserInfo(account) {
  nim.getUser({
    account,
    sync: true,
    done: function (err, user) {
      if (err) {
        console.error("获取用户信息失败", err);
      } else {
        store.nim.users[user.account] = user;
      }
    },
  });
}

/**
 * 获取群会话对应的 team 信息。
 */
function updateTeamInfo(teamId) {
  nim.getTeam({
    teamId,
    sync: true,
    done: function (err, team) {
      if (err) {
        console.error("获取群信息失败", err);
      } else {
        store.nim.teams[team.teamId] = team;
      }
    },
  });
}

/**
 * 获取超级群会话对应的 superTeam 信息。
 */
function updateSuperTeamInfo(teamId) {
  nim.getSuperTeam({
    teamId,
    sync: true,
    done: function (err, team) {
      if (err) {
        console.error("获取超级群信息失败", err);
      } else {
        store.nim.superTeams[team.teamId] = team;
      }
    },
  });
}
