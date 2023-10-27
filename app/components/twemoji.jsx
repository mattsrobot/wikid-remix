import React, { memo } from 'react';
import twemoji from 'twemoji';

import "./styles.twemoji.css"

function Twemoji({ emoji }) {

  let img = twemoji.parse(emoji, {
    folder: 'svg',
    ext: '.svg'
  });

  img = img.replace("<img", "<img height=20 width=20");

  return <span dangerouslySetInnerHTML={{__html: img}}/>
}

export default memo(Twemoji)
