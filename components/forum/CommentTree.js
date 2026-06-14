import React from 'react';
import { View } from 'react-native';
import CommentItem from './CommentItem';

export default function CommentTree({ comments = [], authorId, onReply, onHelpful, onReport, depth = 0 }) {
  return (
    <View>
      {comments.map(c => (
        <View key={String(c.id)}>
          <CommentItem
            comment={c}
            isAuthor={c.user_id === authorId}
            depth={depth}
            onReply={onReply}
            onHelpful={onHelpful}
            onReport={onReport}
          />
          {c.replies?.length ? (
            <CommentTree comments={c.replies} authorId={authorId} depth={depth + 1}
              onReply={onReply} onHelpful={onHelpful} onReport={onReport} />
          ) : null}
        </View>
      ))}
    </View>
  );
}
