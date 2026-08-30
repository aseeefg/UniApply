export default function UniversityLink({ university, children, ...rest }) {
  const website = university?.universityProfile?.website;

  if (!website) {
    return <span {...rest}>{children}</span>;
  }

  const href = /^https?:\/\//i.test(website) ? website : `https://${website}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
