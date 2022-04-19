(function () {
let amis = amisRequire('amis/embed');
const match = amisRequire('path-to-regexp').match;
const history = History.createHashHistory();

const app = {
  type: "app",
  brandName: "Rotten Potatoes",
  pages: [
    {
      url: "/",
      redirect: "movie"
    },
    {
      children: [
        {
          url: "login",
          visible: false,
          schema: {
            type: "form",
            title: "login",
            api: "post:/api/login",
            onFinished: ret => {
              localStorage.setItem("token", ret.token)
            },
            body: [
              {
                type: "input-text",
                name: "name",
                label: "Name"
              },
              {
                type: "input-password",
                name: "password",
                label: "Password"
              }
            ],
            actions: [
              {
                label: "No account? Register!",
                type: "button",
                level: "link",
                onClick: () => {
                  history.push('/register')
                }
              },
              {
                type: "submit",
                label: "login"
              }
            ]
          }
        },
        {
          url: "register",
          visible: false,
          schema: {
            type: "form",
            title: "register",
            api: "post:/api/register",
            onFinished: () => {
              history.push('/login')
            },
            body: [
              {
                type: "input-text",
                name: "name",
                label: "Name"
              },
              {
                type: "input-password",
                name: "password",
                label: "Password"
              }
            ],
            actions: [
              {
                label: "Have an account? Login!",
                type: "button",
                level: "link",
                onClick: () => {
                  history.push('/login')
                }
              },
              {
                type: "submit",
                label: "register"
              }
            ]
          }
        },
        {
          label: "movie",
          url: "movie",
          schema: {
            type: "page",
            title: "movie"
          }
        },
        {
          label: "actor",
          url: "actor",
          schema: {
            type: "page",
            title: "actor"
          }
        },
        {
          label: "comment",
          url: "comment",
          schema: {
            type: "page",
            title: "comment"
          }
        },
        {
          label: "me",
          url: "me",
          schema: {
            type: "page",
            title: "me",
            initApi: "get:/api/user/info",
            body: [
              {
                type: "wrapper",
                body: "Name: ${name}"
              },
              {
                type: "button-group",
                buttons: [
                  {
                    label: "change name",
                    type: "button",
                    actionType: "dialog",
                    dialog: {
                      title: "change name",
                      body: {
                        type: "form",
                        api: "post:/api/user/change-name",
                        onFinished: () => {
                          window.location.reload()
                        },
                        body: [
                          {
                            type: "input-text",
                            name: "new_name",
                            label: "New Name",
                            required: true
                          }
                        ]
                      }
                    }
                  },
                  {
                    label: "change password",
                    type: "button",
                    actionType: "dialog",
                    dialog: {
                      title: "change password",
                      body: {
                        type: "form",
                        api: "post:/api/user/change-password",
                        body: [
                          {
                            type: "input-password",
                            name: "old_password",
                            label: "Old",
                            required: true
                          },
                          {
                            type: "input-password",
                            name: "new_password",
                            label: "New",
                            required: true
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
};

function normalizeLink(to, location = history.location) {
to = to || '';

if (to && to[0] === '#') {
  to = location.pathname + location.search + to;
} else if (to && to[0] === '?') {
  to = location.pathname + to;
}

const idx = to.indexOf('?');
const idx2 = to.indexOf('#');
let pathname = ~idx
  ? to.substring(0, idx)
  : ~idx2
  ? to.substring(0, idx2)
  : to;
let search = ~idx ? to.substring(idx, ~idx2 ? idx2 : undefined) : '';
let hash = ~idx2 ? to.substring(idx2) : location.hash;

if (!pathname) {
  pathname = location.pathname;
} else if (pathname[0] != '/' && !/^https?\:\/\//.test(pathname)) {
  let relativeBase = location.pathname;
  const paths = relativeBase.split('/');
  paths.pop();
  let m;
  while ((m = /^\.\.?\//.exec(pathname))) {
  if (m[0] === '../') {
    paths.pop();
  }
  pathname = pathname.substring(m[0].length);
  }
  pathname = paths.concat(pathname).join('/');
}

return pathname + search + hash;
}

function isCurrentUrl(to, ctx) {
if (!to) {
  return false;
}
const pathname = history.location.pathname;
const link = normalizeLink(to, {
  ...location,
  pathname,
  hash: ''
});

if (!~link.indexOf('http') && ~link.indexOf(':')) {
  let strict = ctx && ctx.strict;
  return match(link, {
  decode: decodeURIComponent,
  strict: typeof strict !== 'undefined' ? strict : true
  })(pathname);
}

return decodeURI(pathname) === link;
}

let amisInstance = amis.embed(
'#root',
app,
{
  location: history.location,
  locale: 'en-US'
},
{
  requestAdaptor(api) {
    console.log(api)
    return {
      ...api,
      headers: {
        authorization: localStorage.getItem("token")
      }
    }
  },
  responseAdaptor(payload, response) {
    console.log(response)
    if (response.status === 401) history.push('/login')
    return response
  },
  // watchRouteChange: fn => {
  //   return history.listen(fn);
  // },
  updateLocation: (location, replace) => {
  location = normalizeLink(location);
  if (location === 'goBack') {
    return history.goBack();
  } else if (
    (!/^https?\:\/\//.test(location) &&
    location ===
      history.location.pathname + history.location.search) ||
    location === history.location.href
  ) {
    // 目标地址和当前地址一样，不处理，免得重复刷新
    return;
  } else if (/^https?\:\/\//.test(location) || !history) {
    return (window.location.href = location);
  }

  history[replace ? 'replace' : 'push'](location);
  },
  jumpTo: (to, action) => {
  if (to === 'goBack') {
    return history.goBack();
  }

  to = normalizeLink(to);

  if (isCurrentUrl(to)) {
    return;
  }

  if (action && action.actionType === 'url') {
    action.blank === false
    ? (window.location.href = to)
    : window.open(to, '_blank');
    return;
  } else if (action && action.blank) {
    window.open(to, '_blank');
    return;
  }

  if (/^https?:\/\//.test(to)) {
    window.location.href = to;
  } else if (
    (!/^https?\:\/\//.test(to) &&
    to === history.pathname + history.location.search) ||
    to === history.location.href
  ) {
    // do nothing
  } else {
    history.push(to);
  }
  },
  isCurrentUrl: isCurrentUrl,
  theme: 'cxd'
}
);

history.listen(state => {
amisInstance.updateProps({
  location: state.location || state
});
});
})();