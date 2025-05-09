import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Tuple


def load_covid_data(file_path: str) -> pd.DataFrame:
    """
    Load COVID-19 data from CSV file.

    Args:
        file_path: Path to the CSV file

    Returns:
        DataFrame containing COVID-19 data
    """
    df = pd.read_csv(file_path)
    # Ensure column names are stripped of any whitespace
    df.columns = df.columns.str.strip()

    # Fix the non-breaking space character in column names
    df.columns = df.columns.str.replace("\xa0", " ")

    return df


def create_case_death_scatter(df: pd.DataFrame) -> plt.Figure:
    """
    Create a scatter plot comparing death rates per million vs. cases per million.

    Args:
        df: DataFrame containing COVID-19 data

    Returns:
        Matplotlib figure with the scatter plot
    """
    # Check if the required columns exist
    required_columns = [
        "Tot Cases/1M pop",
        "Tot Deaths/1M pop",
        "Death percentage",
        "Population",
        "Country",
    ]
    for col in required_columns:
        if col not in df.columns:
            print(
                f"Warning: Column '{col}' not found. Available columns: {df.columns.tolist()}"
            )

    fig, ax = plt.subplots(figsize=(12, 8))

    scatter = ax.scatter(
        df["Tot Cases/1M pop"],
        df["Tot Deaths/1M pop"],
        alpha=0.7,
        c=df["Death percentage"],
        cmap="YlOrRd",
        s=df["Population"] / 1e6,
        edgecolors="black",
        linewidths=0.5,
    )

    # Add colorbar for death percentage
    cbar = plt.colorbar(scatter)
    cbar.set_label("Death Percentage")

    # Add labels for some notable countries
    for i, country in enumerate(df["Country"]):
        if (
            df.iloc[i]["Population"] > 100000000
            or df.iloc[i]["Tot Deaths/1M pop"] > 3000
        ):
            ax.annotate(
                country,
                (df.iloc[i]["Tot Cases/1M pop"], df.iloc[i]["Tot Deaths/1M pop"]),
                fontsize=8,
                alpha=0.7,
            )

    ax.set_title("COVID-19: Deaths per Million vs. Cases per Million")
    ax.set_xlabel("Cases per Million")
    ax.set_ylabel("Deaths per Million")
    ax.grid(True, alpha=0.3)

    return fig


def create_continent_analysis(df: pd.DataFrame) -> plt.Figure:
    """
    Create visualization for continent-level analysis.

    Args:
        df: DataFrame containing COVID-19 data

    Returns:
        Matplotlib figure with continent analysis plot
    """
    # Group data by continent
    continent_data = (
        df.groupby("Continent")
        .agg(
            {
                "Total Cases": "sum",
                "Total Deaths": "sum",
                "Population": "sum",
                "Death percentage": "mean",
            }
        )
        .reset_index()
    )

    # Calculate cases and deaths per million for continents
    continent_data["Cases per Million"] = (
        continent_data["Total Cases"] / continent_data["Population"]
    ) * 1e6
    continent_data["Deaths per Million"] = (
        continent_data["Total Deaths"] / continent_data["Population"]
    ) * 1e6

    # Create grouped bar chart
    fig, ax = plt.subplots(figsize=(12, 6))
    x = np.arange(len(continent_data["Continent"]))
    width = 0.35

    ax.bar(
        x - width / 2,
        continent_data["Cases per Million"],
        width,
        label="Cases per Million",
    )
    ax.bar(
        x + width / 2,
        continent_data["Deaths per Million"],
        width,
        label="Deaths per Million",
    )

    ax.set_xticks(x)
    ax.set_xticklabels(continent_data["Continent"], rotation=45, ha="right")
    ax.set_title("COVID-19 Impact by Continent")
    ax.set_ylabel("Count per Million")
    ax.legend()
    plt.tight_layout()

    return fig


def create_population_bubble_chart(df: pd.DataFrame) -> go.Figure:
    """
    Create a bubble chart with population size as the bubble size.

    Args:
        df: DataFrame containing COVID-19 data

    Returns:
        Plotly figure with the bubble chart
    """
    # Filter out countries with missing data
    filtered_df = df.dropna(subset=["Total Cases", "Total Deaths", "Population"])

    # Create bubble chart
    fig = px.scatter(
        filtered_df,
        x="Total Cases",
        y="Total Deaths",
        size="Population",
        color="Continent",
        hover_name="Country",
        log_x=True,
        log_y=True,
        size_max=60,
    )

    # Update layout
    fig.update_layout(
        title="COVID-19 Cases vs Deaths (Bubble Size = Population)",
        xaxis_title="Total Cases (log scale)",
        yaxis_title="Total Deaths (log scale)",
        legend_title="Continent",
        height=800,
        width=1200,
    )

    # Show only labels for top countries by total cases
    top_countries = filtered_df.nlargest(10, "Total Cases")

    for country in top_countries["Country"]:
        country_data = filtered_df[filtered_df["Country"] == country]
        fig.add_annotation(
            x=country_data["Total Cases"].values[0],
            y=country_data["Total Deaths"].values[0],
            text=country,
            showarrow=True,
            arrowhead=1,
            font=dict(size=10),
        )

    return fig


def create_death_percentage_map(df: pd.DataFrame) -> go.Figure:
    """
    Create a choropleth map showing death percentages by country.

    Args:
        df: DataFrame containing COVID-19 data

    Returns:
        Plotly figure with the choropleth map
    """
    fig = px.choropleth(
        df,
        locations="ISO 3166-1 alpha-3 CODE",
        color="Death percentage",
        hover_name="Country",
        color_continuous_scale="Reds",
        range_color=[0, df["Death percentage"].quantile(0.95)],
        title="COVID-19 Death Percentage by Country",
        labels={"Death percentage": "Death %"},
    )

    fig.update_layout(
        height=800,
        width=1200,
        geo=dict(showframe=False, showcoastlines=True, projection_type="natural earth"),
    )

    return fig


def format_number(num: float) -> str:
    """
    Format large numbers with K (thousands) and M (millions) suffixes.

    Args:
        num: Number to format

    Returns:
        Formatted number string with K or M suffix
    """
    if num >= 1e6:
        return f"{num/1e6:.1f}M"
    elif num >= 1e3:
        return f"{num/1e3:.1f}K"
    else:
        return f"{num:.0f}"


def create_metrics_dashboard(df: pd.DataFrame) -> Tuple[plt.Figure, plt.Figure]:
    """
    Create a dashboard of bar charts showing multiple metrics for top 20 countries.

    Args:
        df: DataFrame containing COVID-19 data

    Returns:
        Tuple of Matplotlib figures with the metrics dashboard
    """
    # Select top 20 countries by total cases
    top_countries = df.nlargest(20, "Total Cases").copy()

    # Create figure for total cases and deaths
    fig1, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))

    # Sort data for total cases
    top_countries_cases = top_countries.sort_values("Total Cases")

    # Plot total cases
    bars1 = ax1.barh(
        top_countries_cases["Country"],
        top_countries_cases["Total Cases"],
        color="cornflowerblue",
    )
    ax1.set_title("Total Cases")
    ax1.set_xlabel("Number of Cases")
    ax1.ticklabel_format(style="plain", axis="x")

    # Add values to the bars with K/M formatting
    for bar in bars1:
        width = bar.get_width()
        ax1.text(
            width * 1.01,
            bar.get_y() + bar.get_height() / 2,
            format_number(width),
            va="center",
            fontsize=8,
        )

    # Sort data for total deaths
    top_countries_deaths = top_countries.sort_values("Total Deaths")

    # Plot total deaths
    bars2 = ax2.barh(
        top_countries_deaths["Country"],
        top_countries_deaths["Total Deaths"],
        color="crimson",
    )
    ax2.set_title("Total Deaths")
    ax2.set_xlabel("Number of Deaths")
    ax2.ticklabel_format(style="plain", axis="x")

    # Add values to the bars with K/M formatting
    for bar in bars2:
        width = bar.get_width()
        ax2.text(
            width * 1.01,
            bar.get_y() + bar.get_height() / 2,
            format_number(width),
            va="center",
            fontsize=8,
        )

    plt.tight_layout()

    # Create figure for cases per million and deaths per million
    fig2, (ax3, ax4) = plt.subplots(1, 2, figsize=(16, 8))

    # Sort data for cases per million
    top_countries_cases_per_m = top_countries.sort_values("Tot Cases/1M pop")

    # Plot cases per million
    bars3 = ax3.barh(
        top_countries_cases_per_m["Country"],
        top_countries_cases_per_m["Tot Cases/1M pop"],
        color="lightseagreen",
    )
    ax3.set_title("Cases per Million")
    ax3.set_xlabel("Cases per Million Population")

    # Add values to the bars with K/M formatting
    for bar in bars3:
        width = bar.get_width()
        ax3.text(
            width * 1.01,
            bar.get_y() + bar.get_height() / 2,
            format_number(width),
            va="center",
            fontsize=8,
        )

    # Sort data for deaths per million
    top_countries_deaths_per_m = top_countries.sort_values("Tot Deaths/1M pop")

    # Plot deaths per million
    bars4 = ax4.barh(
        top_countries_deaths_per_m["Country"],
        top_countries_deaths_per_m["Tot Deaths/1M pop"],
        color="darkorange",
    )
    ax4.set_title("Deaths per Million")
    ax4.set_xlabel("Deaths per Million Population")

    # Add values to the bars with K/M formatting
    for bar in bars4:
        width = bar.get_width()
        ax4.text(
            width * 1.01,
            bar.get_y() + bar.get_height() / 2,
            format_number(width),
            va="center",
            fontsize=8,
        )

    plt.tight_layout()

    return fig1, fig2


def main() -> None:
    """
    Main function to run the COVID-19 data visualization.
    """
    # Load data
    file_path = "covid-19/COVID-19 Coronavirus.csv"
    df = load_covid_data(file_path)

    # Create visualizations
    case_death_fig = create_case_death_scatter(df)
    continent_bar_fig = create_continent_analysis(df)
    bubble_fig = create_population_bubble_chart(df)
    map_fig = create_death_percentage_map(df)
    metrics_fig1, metrics_fig2 = create_metrics_dashboard(df)

    # Show matplotlib figures
    plt.figure(case_death_fig.number)
    plt.figure(continent_bar_fig.number)
    plt.figure(metrics_fig1.number)
    plt.figure(metrics_fig2.number)
    plt.show()

    # Show plotly figures in browser
    bubble_fig.show()
    map_fig.show()


if __name__ == "__main__":
    main()
