interface PageCanvasProps {
    title: string;
    summary: string;
    sections: readonly {
        heading: string;
        items: readonly string[];
    }[];
}

export function PageCanvas({ title, summary, sections }: PageCanvasProps) {
    return (
        <section className="page-canvas" aria-label={title}>
            <header className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-summary">{summary}</p>
                </div>
            </header>
            <div className="page-sections">
                {sections.map((section) => (
                    <article key={section.heading} className="surface-panel">
                        <h2 className="surface-title">{section.heading}</h2>
                        <ul className="surface-list">
                            {section.items.map((item) => (
                                <li key={item} className="surface-list-item">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </section>
    );
}
