import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# Define paths
BASE_DIR = Path(__file__).parent
CSV_FILE_PATH = BASE_DIR / "pet_ownership.csv"
OUTPUT_DIR = BASE_DIR

# Chart styling
plt.style.use("seaborn-v0_8-whitegrid")


def load_data(file_path: Path) -> pd.DataFrame:
    """
    Loads pet ownership data from a CSV file.

    Args:
        file_path: Path to the CSV file.

    Returns:
        A pandas DataFrame containing the pet ownership data.
    """
    return pd.read_csv(file_path)


def create_year_chart(
    df: pd.DataFrame, year: int, column_name: str, output_path: Path, color: str
) -> None:
    """
    Creates and saves a bar chart for pet ownership in a specific year.

    Args:
        df: DataFrame containing the data.
        year: The year for which to generate the chart (e.g., 2019).
        column_name: The name of the column in the DataFrame holding the data for that year.
        output_path: Path to save the generated PNG chart.
        color: Color for the bars in the chart.
    """
    df_year = df[["animal", column_name]].sort_values(by=column_name, ascending=False)
    plt.figure(figsize=(10, 7))  # Increased height for better label visibility
    bars = plt.bar(df_year["animal"], df_year[column_name], color=color)
    plt.xlabel("Type of Pet")
    plt.ylabel("Percentage of Households (%)")
    plt.title(f"Pet Ownership in Australia ({year})")
    plt.xticks(rotation=45, ha="right")
    plt.ylim(0, df_year[column_name].max() * 1.15)  # Ensure space for labels

    for bar in bars:
        yval = bar.get_height()
        plt.text(
            bar.get_x() + bar.get_width() / 2.0,
            yval + 0.5,
            f"{yval}%",
            ha="center",
            va="bottom",
            fontsize=9,
        )

    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"Generated chart: {output_path}")


def create_comparison_chart(df: pd.DataFrame, output_path: Path) -> None:
    """
    Creates and saves a grouped bar chart comparing 2019 and 2021 pet ownership.

    Args:
        df: DataFrame containing the data for both years.
        output_path: Path to save the generated PNG chart.
    """
    n_groups = len(df["animal"])
    index = np.arange(n_groups)
    bar_width = 0.35

    fig, ax = plt.subplots(figsize=(12, 8))  # Increased height
    bars1 = ax.bar(
        index - bar_width / 2, df["pets2019"], bar_width, label="2019", color="skyblue"
    )
    bars2 = ax.bar(
        index + bar_width / 2,
        df["pets2021"],
        bar_width,
        label="2021",
        color="lightcoral",
    )

    ax.set_xlabel("Type of Pet")
    ax.set_ylabel("Percentage of Households (%)")
    ax.set_title("Pet Ownership Comparison (2019 vs 2021)")
    ax.set_xticks(index)
    ax.set_xticklabels(df["animal"], rotation=45, ha="right")
    ax.legend(title="Year")
    ax.set_ylim(
        0, max(df["pets2019"].max(), df["pets2021"].max()) * 1.15
    )  # Ensure space for labels

    for bar_group in [bars1, bars2]:
        for bar in bar_group:
            yval = bar.get_height()
            if yval > 0:  # Avoid labeling zero-height bars if any
                ax.text(
                    bar.get_x() + bar.get_width() / 2.0,
                    yval + 0.5,
                    f"{yval}%",
                    ha="center",
                    va="bottom",
                    fontsize=9,
                )

    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"Generated chart: {output_path}")


def main() -> None:
    """
    Main function to load data and generate all charts.
    """
    if not CSV_FILE_PATH.exists():
        print(f"Error: CSV file not found at {CSV_FILE_PATH}")
        return

    df = load_data(CSV_FILE_PATH)

    # Chart for 2019
    create_year_chart(
        df.copy(), 2019, "pets2019", OUTPUT_DIR / "pets_2019.png", "skyblue"
    )

    # Chart for 2021
    create_year_chart(
        df.copy(), 2021, "pets2021", OUTPUT_DIR / "pets_2021.png", "lightcoral"
    )

    # Comparison chart for 2019 vs 2021
    create_comparison_chart(df.copy(), OUTPUT_DIR / "pets_comparison_2019_2021.png")


if __name__ == "__main__":
    main()
