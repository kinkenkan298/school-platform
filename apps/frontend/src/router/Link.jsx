export default function Link({ to, className = "", children, ...props }) {
  const href = `#${to.startsWith("/") ? to : `/${to}`}`;
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}