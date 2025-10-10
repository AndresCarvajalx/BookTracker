const LoadingScreen = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-white light:bg-neutral-900">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-(--green-color)"></div>
    </div>
  );
};

export default LoadingScreen;
