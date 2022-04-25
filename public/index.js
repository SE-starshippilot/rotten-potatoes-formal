(function () {
let amis = amisRequire('amis/embed');
const match = amisRequire('path-to-regexp').match;
const history = History.createHashHistory();

const comments_component = (under_user) => ({
  type: 'each',
  source: '${comments}',
  items: {
    type: 'panel',
    title: {
      type: 'wrapper',
      className: 'flex justify-between items-center',
      body: [
        {
          type: 'avatar',
          src: under_user ? '${cover_url}' : '${avatar_url}',
        },
        {
          type: 'wrapper',
          body: under_user ? '${name}' : '${name}'
        },
        {
          type: 'wrapper',
          body: '${comment_date}'
        },
        {
          type: 'action',
          label: under_user ? 'go to movie detail page' : 'go to user homepage',
          actionType: 'link',
          link: under_user ? '/movie/${id}' : '/user/${id}'
        }
      ]
    },
    body: [
      {
        type: 'wrapper',
        body: 'Rate: ${rate}'
      },
      {
        type: 'wrapper',
        body: 'Comment: ${content}'
      }
    ]
  }
});

const login = {
  url: 'login',
  visible: false,
  schema: {
    type: 'form',
    title: 'Login',
    api: 'post:/api/login',
    onFinished: ret => {
      localStorage.setItem('token', ret.token)
      history.push('/')
    },
    body: [
      {
        type: 'input-text',
        name: 'name',
        label: 'Name',
        required: true
      },
      {
        type: 'input-password',
        name: 'password',
        label: 'Password',
        required: true
      }
    ],
    actions: [
      {
        label: 'No account? Register!',
        type: 'button',
        level: 'link',
        onClick: () => {
          history.push('/register')
        }
      },
      {
        type: 'submit',
        label: 'login'
      }
    ]
  }
};

const register = {
  url: 'register',
  visible: false,
  schema: {
    type: 'form',
    title: 'Register',
    api: 'post:/api/register',
    onFinished: () => {
      history.push('/login')
    },
    body: [
      {
        type: 'input-text',
        name: 'name',
        label: 'Name',
        required: true
      },
      {
        type: 'input-password',
        name: 'password',
        label: 'Password',
        required: true
      }
    ],
    actions: [
      {
        label: 'Have an account? Login!',
        type: 'button',
        level: 'link',
        onClick: () => {
          history.push('/login')
        }
      },
      {
        type: 'submit',
        label: 'register'
      }
    ]
  }
};

const movies = {
  label: 'Movie',
  icon: 'fas fa-film',
  url: 'movie',
  schema: {
    type: 'page',
    title: 'Movie',
    body: {
      type: 'crud',
      api: 'get:/api/movie/list',
      footerToolBar: ["switch-per-page", "pagination"],
      syncLocation: false,
      mode: 'cards',
      placeholder: 'no movie',
      card: {
        className: 'flex items-center',
        header: {
          avatar: '${cover_url}',
        },
        body: '${name}',
        itemAction: {
          type: 'button',
          actionType: 'link',
          url: '/movie/${id}'
        }
      }
    }
  }
};

const movie = {
  url: 'movie/:id',
  visible: false,
  schema: {
    type: 'page',
    body: {
      type: 'service',
      api: 'get:/api/movie/detail/${params.id}',
      body: [
        {
          type: 'wrapper',
          className: 'flex flex-row justify-between items-center',
          body: [
            {
              type: 'wrapper',
              className: 'flex flex-row justify-between items-center',
              body: [
                {
                  type: 'image',
                  src: '${cover_url}',
                  thumbMode: 'cover',
                  enlargeAble: true
                },
                {
                  type: 'wrapper',
                  className: 'ml-8',
                  body: [
                    {
                      type: 'html',
                      html: '<h1>${name}</h1>'
                    },
                    {
                      type: 'html',
                      html: '<h3>rate: ${rate}</h3>'
                    },
                    {
                      type: 'html',
                      html: '<h3>release: ${release_year}</h3>'
                    }
                  ]
                }
              ]
            },
            {
              label: 'add comment',
              type: 'button',
              actionType: 'dialog',
              dialog: {
                title: 'add comment',
                body: {
                  type: 'form',
                  api: 'post:/api/comment/add-to-movie/${params.id}',
                  onFinished: () => {
                    window.location.reload()
                  },
                  body: [
                    {
                      type: 'input-rating',
                      name: 'rate',
                      label: 'Rate',
                      count: 10,
                      required: true
                    },
                    {
                      type: 'input-text',
                      name: 'content',
                      label: 'Comment',
                      required: true
                    }
                  ]
                }
              }
            },
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'html',
          html: '<h2>Introduction</h2>'
        },
        {
          type: 'wrapper',
          body: '${introduction}'
        },
        {
          type: 'divider'
        },
        {
          type: 'html',
          html: '<h2>Actors</h2>'
        },
        {
          type: 'cards',
          source: '${actors}',
          card: {
            header: {
              className: 'flex flex-col items-center',
              avatar: '${photo_url}',
              title: '${name}',
              subTitle: '${character_name}'
            },
            itemAction: {
              type: 'button',
              actionType: 'link',
              url: '/actor/${id}'
            }
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'html',
          html: '<h2>Comments</h2>'
        },
        comments_component(under_user = false)
      ]
    }
  }
};

const actors = {
  label: 'Actor',
  url: 'actor',
  icon: 'fas fa-male',
  schema: {
    type: 'page',
    title: 'Actor',
    body: {
      type: 'crud',
      api: 'get:/api/actor/list',
      syncLocation: false,
      mode: 'cards',
      placeholder: 'no actor',
      card: {
        className: 'flex items-center',
        header: {
          avatar: '${photo_url}',
        },
        body: '${name}',
        itemAction: {
          type: 'button',
          actionType: 'link',
          url: '/actor/${id}'
        }
      }
    }
  }
};

const actor = {
  url: 'actor/:id',
  visible: false,
  schema: {
    type: 'page',
    body: {
      type: 'service',
      api: 'get:/api/actor/detail/${params.id}',
      body: [
        {
          type: 'wrapper',
          className: 'flex',
          body: [
            {
              type: 'image',
              src: '${photo_url}',
              thumbMode: 'cover',
              enlargeAble: true
            },
            {
              type: 'wrapper',
              className: 'ml-8',
              body: [
                {
                  type: 'html',
                  html: '<h1>${name}</h1>'
                },
                {
                  type: 'html',
                  html: '<h3>birthday: ${birth_date}</h3>'
                }
              ]
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'html',
          html: '<h2>Introduction</h2>'
        },
        {
          type: 'wrapper',
          body: '${introduction}'
        },
        {
          type: 'divider'
        },
        {
          type: 'html',
          html: '<h2>Movies</h2>'
        },
        {
          type: 'cards',
          source: '${movies}',
          card: {
            header: {
              className: 'flex flex-col items-center',
              avatar: '${cover_url}',
              title: '${name}',
              subTitle: '${character_name}'
            },
            itemAction: {
              type: 'button',
              actionType: 'link',
              url: '/movie/${id}'
            }
          }
        }
      ]
    }
  }
};

const comments = {
  label: 'Comment',
  url: 'comment',
  icon: 'fas fa-comment-dots',
  schema: {
    type: 'page',
    title: 'Comment',
    body: {
      type: 'service',
      api: 'get:/api/comment/list',
      body: {
        type: 'pagination-wrapper',
        body: {
          type: 'each',
          source: '${items}',
          items: {
            type: 'panel',
            title: {
              type: 'wrapper',
              className: 'flex justify-between items-center',
              body: [
                {
                  type: 'wrapper',
                  className: 'flex flex-col items-center',
                  body: [
                    {
                      type: 'avatar',
                      src: '${avatar_url}'
                    },
                    {
                      type: 'wrapper',
                      body: '${user_name}'
                    }
                  ]
                },
                {
                  type: 'wrapper',
                  className: 'flex flex-col items-center',
                  body: [
                    {
                      type: 'avatar',
                      src: '${cover_url}'
                    },
                    {
                      type: 'wrapper',
                      body: '${movie_name}'
                    }
                  ]
                },
                {
                  type: 'wrapper',
                  body: '${comment_date}'
                },
                {
                  type: 'dropdown-button',
                  label: 'go to ...',
                  trigger: 'hover',
                  hideCaret: true,
                  buttons: [
                    {
                      type: 'action',
                      size: 'xs',
                      label: 'user homepage',
                      actionType: 'link',
                      link: '/user/${user_id}'
                    },
                    {
                      type: 'action',
                      size: 'xs',
                      label: 'movie detail page',
                      actionType: 'link',
                      link: '/movie/${movie_id}'
                    }
                  ]
                },
                {
                  type: 'wrapper',
                  body: ''
                }
              ]
            },
            body: [
              {
                type: 'wrapper',
                body: 'Rate: ${rate}'
              },
              {
                type: 'wrapper',
                body: 'Comment: ${content}'
              }
            ]
          }
        }
      }
    }
  }
};

const me = {
  label: 'Me',
  url: 'me',
  icon: 'fas fa-user-circle',
  schema: {
    type: 'page',
    title: 'Me',
    body: {
      type: 'service',
      api: 'get:/api/user/me/info',
      body: [
        {
          type: 'image',
          src: '${avatar_url}',
          thumbMode: 'cover',
          enlargeAble: true
        },
        {
          type: 'wrapper',
          className: 'text-2xl font-bold',
          body: '${name}'
        },
        {
          type: 'button-group',
          buttons: [
            {
              label: 'change avatar',
              type: 'button',
              actionType: 'dialog',
              dialog: {
                title: 'change avatar',
                body: {
                  type: 'form',
                  api: 'post:/api/user/me/change-avatar',
                  onFinished: () => {
                    window.location.reload()
                  },
                  body: {
                    type: 'input-file',
                    label: 'avatar',
                    name: 'avatar',
                    accept: '.png,.jpg,.jpeg',
                    asBlob: true
                  }
                }
              }
            },
            {
              label: 'change name',
              type: 'button',
              actionType: 'dialog',
              dialog: {
                title: 'change name',
                body: {
                  type: 'form',
                  api: 'put:/api/user/me/change-name',
                  onFinished: () => {
                    window.location.reload()
                  },
                  body: [
                    {
                      type: 'input-text',
                      name: 'new_name',
                      label: 'New Name',
                      required: true
                    }
                  ]
                }
              }
            },
            {
              label: 'change password',
              type: 'button',
              actionType: 'dialog',
              dialog: {
                title: 'change password',
                body: {
                  type: 'form',
                  api: 'put:/api/user/me/change-password',
                  body: [
                    {
                      type: 'input-password',
                      name: 'old_password',
                      label: 'Old',
                      required: true
                    },
                    {
                      type: 'input-password',
                      name: 'new_password',
                      label: 'New',
                      required: true
                    }
                  ]
                }
              }
            },
            {
              label: 'log out',
              type: 'button',
              onClick: () => {
                localStorage.removeItem('token')
                history.push('/login')
              }
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'html',
          html: '<h2>Comments</h2>'
        },
        comments_component(under_user = true)
      ]
    }
  }
};

const user = {
  url: 'user/:id',
  visible: false,
  schema: {
    type: 'page',
    body: {
      type: 'service',
      api: 'get:/api/user/info/${params.id}',
      body: [
        {
          type: 'image',
          src: '${avatar_url}',
          thumbMode: 'cover',
          enlargeAble: true
        },
        {
          type: 'wrapper',
          className: 'text-2xl font-bold',
          body: '${name}'
        },
        {
          type: 'divider'
        },
        {
          type: 'html',
          html: '<h2>Comments</h2>'
        },
        comments_component(under_user = true)
      ]
    }
  }
};

const app = {
  type: 'app',
  brandName: 'Rotten Potatoes',
  pages: [
    {
      url: '/',
      redirect: 'movie'
    },
    {
      children: [
        login,
        register,
        movies,
        movie,
        actors,
        actor,
        comments,
        me,
        user
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
        authorization: localStorage.getItem('token')
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