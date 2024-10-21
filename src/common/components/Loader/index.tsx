const Loader = ({ loading }: { loading: boolean }) => {
  return (
    <div
      className={`bg-white fixed inset-0 flex items-center justify-center transition-opacity duration-1000 ease-out ${
        loading ? "opacity-100" : "opacity-0"
      } ${loading ? "z-50" : "z-0"}`}
    >
      {loading && (
        <video
          src="/videos/boston/boston-azul.mp4"
          autoPlay
          muted
          loop
          className="video-background"
        />
      )}
    </div>
  );
};

export default Loader;