interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <header
      style={{
        marginBottom: "2rem",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "2rem",
          fontWeight: "bold",
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            marginTop: "0.5rem",
            color: "#6b7280",
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}