const Notification = ({ message }) => {
  if (message === null || message.message === null) {
    return null;
  }

  return (
    <div className={message.flag === 'notification' ? 'notification' : 'error'}>
      {message.message}
    </div>
  );
};

export default Notification;
