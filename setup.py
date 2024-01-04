from setuptools import find_packages, setup

setup(
    name="compostable-disintegration-analysis",
    version="0.1.0",
    packages=find_packages(
        include=[
            "scripts",
            "scripts.*",
        ]
    ),
    install_requires=[],
)
